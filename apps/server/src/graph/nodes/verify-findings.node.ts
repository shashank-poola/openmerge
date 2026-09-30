import { buildVerificationContext } from "../context/build-verification-context";
import { runFindingVerifier } from "../../agent/finding-verifier.agent";
import { applyVerifierVerdicts } from "../../agent/finding-verifier.apply";
import { reviewTraceOptions } from "../review-trace";
import type { PRReviewStateType } from "../review.state";

export const verifyFindings = async (
  state: PRReviewStateType,
): Promise<Partial<PRReviewStateType>> => {
  const candidates = state.candidateFindings;
  if (state.error) return {};
  if (candidates.length === 0) {
    return {
      verifiedComments: [],
      verificationStats: { candidates: 0, kept: 0, suppressed: 0, uncertain: 0, demoted: 0 },
    };
  }

  const snippets = await buildVerificationContext(candidates, state.repoLocalPath);
  const candidatesWithEvidence = candidates.filter((candidate) =>
    snippets.some((snippet) => snippet.id === `${candidate.id}:diff`),
  );
  if (candidatesWithEvidence.length !== candidates.length) {
    return {
      verifiedComments: [],
      reviewCoverage: "limited",
      error: "FINDING_VERIFICATION_FAILED: grounded evidence was unavailable",
    };
  }

  const result = await runFindingVerifier(candidates, snippets, reviewTraceOptions(state));
  if (result.error) {
    return {
      verifiedComments: [],
      reviewCoverage: "limited",
      error: `FINDING_VERIFICATION_FAILED: ${result.error}`,
    };
  }

  const { comments: verifiedComments, stats } = applyVerifierVerdicts(candidates, result.verdicts);
  console.info("finding verification completed", {
    reviewSessionId: state.reviewSessionId,
    provider: result.provider,
    durationMs: result.durationMs,
    coverage: stats.uncertain > 0 ? "limited" : state.reviewCoverage,
    ...stats,
  });

  return {
    verifiedComments,
    verificationStats: stats,
    reviewCoverage: stats.uncertain > 0 ? "limited" : state.reviewCoverage,
  };
};
