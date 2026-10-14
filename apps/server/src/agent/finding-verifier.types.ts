import { z } from "zod";
import type { AgentComment } from "../types/review-context.type";

export type FindingSourceAgent = "code" | "security" | "performance";

export type FindingCandidate = {
  id: string;
  sourceAgent: FindingSourceAgent;
  comment: AgentComment;
  diffEvidence?: string;
  diffEvidenceAnchorIndex?: number;
};

export type EvidenceSnippet = {
  id: string;
  filePath: string;
  startLine: number;
  endLine: number;
  source: "diff" | "head";
  text: string;
};

const evidenceSchema = z.object({
  snippetId: z.string().min(1).max(120),
  quote: z.string().min(1).max(2_000)
    .refine((value) => value.trim().length > 0)
    .refine((value) => !value.includes("\n") && !value.includes("\r")),
}).strict();

const quoteVariants = (line: string): Set<string> => new Set([
  line.trim(),
  line.replace(/^\d+:\s?/, "").trim(),
  line.replace(/^[+\- ]/, "").trim(),
]);

const normalizeSnippetLine = (line: string, source: EvidenceSnippet["source"]): string => (
  source === "diff"
    ? line.replace(/^[+\- ]/, "")
    : line.replace(/^\d+:\s?/, "")
).trim();

const keptVerdictSchema = z.object({
  candidateId: z.string().min(1).max(120),
  verdict: z.literal("keep"),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  body: z.string().trim().min(1).max(2_000),
  evidence: z.array(evidenceSchema).min(1).max(6),
  preserveSuggestion: z.boolean(),
}).strict();

const rejectedVerdictSchema = z.object({
  candidateId: z.string().min(1).max(120),
  verdict: z.enum(["suppress", "uncertain"]),
  reasonCode: z.enum([
    "not_introduced",
    "counterexample",
    "no_demonstrated_impact",
    "missing_context",
    "speculative",
    "duplicate",
  ]),
}).strict();

const verifierResponseSchema = z.object({
  verdicts: z.array(z.discriminatedUnion("verdict", [keptVerdictSchema, rejectedVerdictSchema])).max(19),
}).strict();

export type FindingVerdict = z.infer<typeof verifierResponseSchema>["verdicts"][number];

export type VerificationStats = {
  candidates: number;
  kept: number;
  suppressed: number;
  uncertain: number;
  demoted: number;
};

export type VerifierParseResult =
  | { ok: true; verdicts: FindingVerdict[] }
  | { ok: false; error: string };

export const unwrapJsonFence = (raw: string): string => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
};

export const parseVerifierResponse = (
  raw: string,
  candidates: FindingCandidate[],
  snippets: EvidenceSnippet[],
): VerifierParseResult => {
  if (raw.length > 64_000) return { ok: false, error: "verifier response exceeds size limit" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(unwrapJsonFence(raw));
  } catch {
    return { ok: false, error: "verifier response is not valid JSON" };
  }

  const validated = verifierResponseSchema.safeParse(parsed);
  if (!validated.success) return { ok: false, error: "verifier response does not match the contract" };

  const expectedIds = new Set(candidates.map((candidate) => candidate.id));
  const seenIds = new Set<string>();
  const snippetsById = new Map(snippets.map((snippet) => [snippet.id, snippet]));

  for (const verdict of validated.data.verdicts) {
    if (!expectedIds.has(verdict.candidateId)) return { ok: false, error: "verifier returned an unknown candidate" };
    if (seenIds.has(verdict.candidateId)) return { ok: false, error: "verifier returned a duplicate candidate" };
    seenIds.add(verdict.candidateId);

    if (verdict.verdict === "keep") {
      let hasChangedCodeEvidence = false;
      const candidate = candidates.find((entry) => entry.id === verdict.candidateId);
      const currentCodeLines = new Set(
        (candidate?.comment.currentCode?.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n") ?? [])
          .map((line) => line.trim()),
      );
      for (const evidence of verdict.evidence) {
        const snippet = snippetsById.get(evidence.snippetId);
        const variants = quoteVariants(evidence.quote);
        const matchedLine = snippet?.text
          .split("\n")
          .map((line) => normalizeSnippetLine(line, snippet.source))
          .find((line) => variants.has(line));
        const exactSnippetLine = matchedLine !== undefined;
        if (!snippet || !evidence.snippetId.startsWith(`${verdict.candidateId}:`) || !exactSnippetLine) {
          return { ok: false, error: "verifier returned unsupported evidence" };
        }
        if (snippet.source === "diff" && matchedLine && currentCodeLines.has(matchedLine)) hasChangedCodeEvidence = true;
      }
      if (!hasChangedCodeEvidence) return { ok: false, error: "verifier did not cite changed code" };
    }
  }

  if (seenIds.size !== expectedIds.size) return { ok: false, error: "verifier omitted a candidate" };
  return { ok: true, verdicts: validated.data.verdicts };
};
