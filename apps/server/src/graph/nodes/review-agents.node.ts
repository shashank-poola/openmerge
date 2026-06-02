import type { PRReviewStateType } from "../review.state";
import { runCodeAgent } from "../../agent/code.agent";
import { runSecurityAgent } from "../../agent/security.agent";
import { runPerformanceAgent } from "../../agent/performance.agent";
import type { AgentInput } from "../../agent/agent.types";

const MAX_DIFF_CHARS = 28_000;

const truncateDiff = (diff: string): string =>
    diff.length <= MAX_DIFF_CHARS ? diff : diff.slice(0, MAX_DIFF_CHARS) + "\n\n[diff truncated]";

const buildInput = (state: PRReviewStateType): AgentInput => ({
    prTitle: state.prTitle ?? `PR #${state.prNumber}`,
    changedFiles: state.changedFiles,
    diff: truncateDiff(state.diff ?? ""),
    context: {
        linterResults: state.linterResults,
        codeGraph: state.codeGraph,
        astSummaries: state.astSummaries,
        importSources: state.importSources,
        prHistory: state.prHistory,
    },
});

export const codeReviewAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const result = await runCodeAgent(buildInput(state));
    return { codeComments: result.comments };
};

export const securityAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const result = await runSecurityAgent(buildInput(state));
    return { securityComments: result.comments };
};

export const performanceAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const result = await runPerformanceAgent(buildInput(state));
    return { performanceComments: result.comments };
};
