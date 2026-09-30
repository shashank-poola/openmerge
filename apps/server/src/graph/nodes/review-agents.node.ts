import type { PRReviewStateType } from "../review.state";
import { runCodeAgent } from "../../agent/code.agent";
import { runSecurityAgent } from "../../agent/security.agent";
import { runPerformanceAgent } from "../../agent/performance.agent";
import type { AgentInput } from "../../agent/agent.types";
import type { AgentResult } from "../../agent/agent.types";
import { selectCompleteHunks } from "../../agent/diff-grounding";
import { reviewTraceOptions } from "../review-trace";

const MAX_DIFF_CHARS = 28_000;

const buildInput = (state: PRReviewStateType): { input: AgentInput; limited: boolean } => {
    const selection = selectCompleteHunks(state.diff ?? "", MAX_DIFF_CHARS);
    return {
        input: {
            prTitle: state.prTitle ?? `PR #${state.prNumber}`,
            changedFiles: state.changedFiles,
            diff: selection.view,
            context: {
                linterResults: state.linterResults,
                codeGraph: state.codeGraph,
                astSummaries: state.astSummaries,
                importSources: state.importSources,
                prHistory: state.prHistory,
            },
        },
        limited: selection.coverage.omittedHunks > 0,
    };
};

const resultMetadata = (
    result: AgentResult,
    limited: boolean,
): Partial<PRReviewStateType> => {
    const failed = Boolean(result.error) || result.outputStatus === "invalid";
    return {
        ...(failed ? {
            error: `SPECIALIST_REVIEW_FAILED: ${result.agentName}`,
            agentFailures: [result.agentName],
        } : {}),
        ...(limited || result.outputStatus === "partial" ? { reviewCoverage: "limited" as const } : {}),
    };
};

export const codeReviewAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const { input, limited } = buildInput(state);
    const result = await runCodeAgent(input, reviewTraceOptions(state));
    return { codeComments: result.comments, ...resultMetadata(result, limited) };
};

export const securityAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const { input, limited } = buildInput(state);
    const result = await runSecurityAgent(input, reviewTraceOptions(state));
    return { securityComments: result.comments, ...resultMetadata(result, limited) };
};

export const performanceAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const { input, limited } = buildInput(state);
    const result = await runPerformanceAgent(input, reviewTraceOptions(state));
    return { performanceComments: result.comments, ...resultMetadata(result, limited) };
};
