import { describe, expect, test } from "bun:test";
import { parseVerifierResponse, type EvidenceSnippet, type FindingCandidate } from "../finding-verifier.types";

const candidates: FindingCandidate[] = [{
  id: "candidate-1",
  sourceAgent: "code",
  comment: {
    filePath: "src/index.ts",
    line: 4,
    body: "The changed call drops the required await.",
    severity: "HIGH",
    category: "BUG",
    currentCode: "runTask();",
  },
}];

const snippets: EvidenceSnippet[] = [{
  id: "candidate-1:diff",
  filePath: "src/index.ts",
  startLine: 4,
  endLine: 4,
  source: "diff",
  text: "runTask();",
}];

describe("parseVerifierResponse", () => {
  test("accepts one evidence-backed verdict per candidate", () => {
    const result = parseVerifierResponse(JSON.stringify({ verdicts: [{
      candidateId: "candidate-1",
      verdict: "keep",
      severity: "MEDIUM",
      body: "The changed call can return before the task completes.",
      evidence: [{ snippetId: "candidate-1:diff", quote: "runTask();" }],
      preserveSuggestion: false,
    }] }), candidates, snippets);

    expect(result.ok).toBe(true);
  });

  test("rejects unknown or omitted candidates", () => {
    expect(parseVerifierResponse('{"verdicts":[]}', candidates, snippets).ok).toBe(false);
    expect(parseVerifierResponse(JSON.stringify({ verdicts: [{
      candidateId: "invented",
      verdict: "suppress",
      reasonCode: "speculative",
    }] }), candidates, snippets).ok).toBe(false);
  });

  test("rejects fabricated evidence quotes", () => {
    const result = parseVerifierResponse(JSON.stringify({ verdicts: [{
      candidateId: "candidate-1",
      verdict: "keep",
      severity: "HIGH",
      body: "Claim",
      evidence: [{ snippetId: "candidate-1:diff", quote: "not present" }],
      preserveSuggestion: false,
    }] }), candidates, snippets);

    expect(result.ok).toBe(false);
  });
});
