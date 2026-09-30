import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { EvidenceSnippet, FindingCandidate, FindingVerdict } from "../../../agent/finding-verifier.types";
import { parseVerifierResponse } from "../../../agent/finding-verifier.types";
import { applyVerifierVerdicts } from "../../../agent/finding-verifier.apply";

type AccuracyCase = {
  id: string;
  candidate: FindingCandidate;
  snippet: EvidenceSnippet;
  verdict: FindingVerdict;
  expectedPublished: number;
};

const fixtureUrl = new URL("../../../../../../tests/fixtures/review-accuracy/cases.json", import.meta.url);
const cases = JSON.parse(readFileSync(fixtureUrl, "utf8")) as AccuracyCase[];

describe("review accuracy fixtures", () => {
  for (const fixture of cases) {
    test(fixture.id, () => {
      const parsed = parseVerifierResponse(
        JSON.stringify({ verdicts: [fixture.verdict] }),
        [fixture.candidate],
        [fixture.snippet],
      );
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;

      const applied = applyVerifierVerdicts([fixture.candidate], parsed.verdicts);
      expect(applied.comments).toHaveLength(fixture.expectedPublished);
    });
  }
});
