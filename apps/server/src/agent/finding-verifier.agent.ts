import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
import { agentTrace, type LLMTraceOptions } from "../llm/llm.trace";
import { FINDING_VERIFIER_HUMAN, FINDING_VERIFIER_SYSTEM } from "../prompts/finding-verifier.prompt";
import {
  parseVerifierResponse,
  type EvidenceSnippet,
  type FindingCandidate,
  type FindingVerdict,
} from "./finding-verifier.types";

export type FindingVerifierResult = {
  verdicts: FindingVerdict[];
  provider: "groq" | "gemini";
  durationMs: number;
  error?: string;
};

export const runFindingVerifier = async (
  candidates: FindingCandidate[],
  snippets: EvidenceSnippet[],
  trace?: LLMTraceOptions,
): Promise<FindingVerifierResult> => {
  const startedAt = Date.now();
  const deadline = AbortSignal.timeout(60_000);
  try {
    const { content, provider } = await invokeLLM(
      [
        new SystemMessage(FINDING_VERIFIER_SYSTEM),
        new HumanMessage(FINDING_VERIFIER_HUMAN(candidates, snippets)),
      ],
      "verification",
      agentTrace("findingVerifier", "agent:verifier", { ...trace, signal: deadline }),
    );
    const parsed = parseVerifierResponse(content, candidates, snippets);
    if (!parsed.ok) throw new Error(parsed.error);
    return { verdicts: parsed.verdicts, provider, durationMs: Date.now() - startedAt };
  } catch (error) {
    return {
      verdicts: [],
      provider: "groq",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
