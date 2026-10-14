import { readFileSync } from "node:fs";
import { runFindingVerifier } from "../../apps/server/src/agent/finding-verifier.agent";
import type { EvidenceSnippet, FindingCandidate } from "../../apps/server/src/agent/finding-verifier.types";

type AccuracyCase = {
  id: string;
  candidate: FindingCandidate;
  snippet: EvidenceSnippet;
  expectedPublished: number;
};

const fixtures = JSON.parse(
  readFileSync(new URL("../fixtures/review-accuracy/cases.json", import.meta.url), "utf8"),
) as AccuracyCase[];

let matched = 0;
const startedAt = Date.now();
for (const fixture of fixtures) {
  const result = await runFindingVerifier([fixture.candidate], [fixture.snippet]);
  const kept = result.verdicts.filter((verdict) => verdict.verdict === "keep").length;
  const passed = !result.error && kept === fixture.expectedPublished;
  if (passed) matched += 1;
  console.log(JSON.stringify({ id: fixture.id, passed, kept, error: result.error ?? null }));
}

console.log(JSON.stringify({
  cases: fixtures.length,
  matched,
  elapsedMs: Date.now() - startedAt,
}));
