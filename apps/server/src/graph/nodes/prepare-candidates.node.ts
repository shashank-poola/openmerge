import { createHash } from "node:crypto";
import { groundCandidate, selectCompleteHunks } from "../../agent/diff-grounding";
import type { FindingCandidate, FindingSourceAgent } from "../../agent/finding-verifier.types";
import type { AgentComment } from "../../types/review-context.type";
import type { PRReviewStateType } from "../review.state";

const MAX_DIFF_CHARS = 28_000;

const identity = (comment: AgentComment): string => JSON.stringify([
  comment.filePath,
  comment.startLine ?? comment.line,
  comment.line,
  comment.category,
  comment.currentCode?.replace(/\r\n/g, "\n").replace(/\r/g, "\n") ?? "",
  comment.body.trim(),
]);

const candidateId = (sourceAgent: FindingSourceAgent, comment: AgentComment): string =>
  `${sourceAgent}-${createHash("sha256").update(identity(comment)).digest("hex").slice(0, 16)}`;

export const prepareCandidates = (
  state: PRReviewStateType,
): Partial<PRReviewStateType> => {
  if (state.error || !state.diff) return { candidateFindings: [] };

  const selection = selectCompleteHunks(state.diff, MAX_DIFF_CHARS);
  const sources: Array<[FindingSourceAgent, AgentComment[]]> = [
    ["code", state.codeComments],
    ["security", state.securityComments],
    ["performance", state.performanceComments],
  ];
  const seen = new Set<string>();
  const candidates: FindingCandidate[] = [];
  let rejected = 0;

  for (const [sourceAgent, comments] of sources) {
    for (const comment of comments) {
      const key = identity(comment);
      if (seen.has(key)) continue;
      seen.add(key);

      const grounding = groundCandidate(comment, selection.index);
      if (grounding.status !== "grounded") {
        rejected += 1;
        continue;
      }

      const diffEvidence = selection.index.files
        .flatMap((file) => file.hunks)
        .find((hunk) => hunk.id === grounding.hunkId)
        ?.rendered;
      candidates.push({ id: candidateId(sourceAgent, comment), sourceAgent, comment, diffEvidence });
    }
  }

  return {
    candidateFindings: candidates,
    reviewCoverage: rejected > 0 || selection.coverage.omittedHunks > 0 ? "limited" : state.reviewCoverage,
  };
};
