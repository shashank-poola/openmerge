import type { LLMTraceOptions } from "../llm/llm.trace";
import type { PRReviewStateType } from "./review.state";

/** Metadata attached to every LLM call of a review so traces are searchable by repo, PR, and commit. */
export const reviewTraceOptions = (state: PRReviewStateType): LLMTraceOptions => ({
    metadata: {
        reviewSessionId: state.reviewSessionId,
        repository: `${state.owner}/${state.repoName}`,
        prNumber: state.prNumber,
        headSha: state.headSha,
        changedFileCount: state.changedFiles.length,
    },
});
