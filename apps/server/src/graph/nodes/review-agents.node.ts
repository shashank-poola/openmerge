import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../../llm/llm.provider";
import type { PRReviewStateType, AgentComment } from "../review.state";
import { CODE_REVIEW_SYSTEM, CODE_REVIEW_HUMAN } from "../../prompts/code-review.prompt";
import { SECURITY_SYSTEM, SECURITY_HUMAN } from "../../prompts/security.prompt";
import { PERFORMANCE_SYSTEM, PERFORMANCE_HUMAN } from "../../prompts/performance.prompt";

const MAX_DIFF_CHARS = 28_000;

const truncateDiff = (diff: string): string =>
    diff.length <= MAX_DIFF_CHARS ? diff : diff.slice(0, MAX_DIFF_CHARS) + "\n\n[diff truncated]";

const parseComments = (raw: string): AgentComment[] => {
    try {
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return [];
        return JSON.parse(match[0]) as AgentComment[];
    } catch {
        return [];
    }
};

export const codeReviewAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};

    const { content } = await invokeLLM([
        new SystemMessage(CODE_REVIEW_SYSTEM),
        new HumanMessage(CODE_REVIEW_HUMAN({
            prTitle: state.prTitle ?? `PR #${state.prNumber}`,
            changedFiles: state.changedFiles,
            diff: truncateDiff(state.diff),
            context: {
                linterResults: state.linterResults,
                codeGraph: state.codeGraph,
                astSummaries: state.astSummaries,
                importSources: state.importSources,
                prHistory: state.prHistory,
            },
        })),
    ], "codeReview");

    return { codeComments: parseComments(content) };
};

export const securityAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};

    const { content } = await invokeLLM([
        new SystemMessage(SECURITY_SYSTEM),
        new HumanMessage(SECURITY_HUMAN({
            prTitle: state.prTitle ?? `PR #${state.prNumber}`,
            changedFiles: state.changedFiles,
            diff: truncateDiff(state.diff),
            context: {
                linterResults: state.linterResults,
                importSources: state.importSources,
                codeGraph: state.codeGraph,
            },
        })),
    ], "security");

    return { securityComments: parseComments(content) };
};

export const performanceAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};

    const { content } = await invokeLLM([
        new SystemMessage(PERFORMANCE_SYSTEM),
        new HumanMessage(PERFORMANCE_HUMAN({
            prTitle: state.prTitle ?? `PR #${state.prNumber}`,
            changedFiles: state.changedFiles,
            diff: truncateDiff(state.diff),
            context: {
                codeGraph: state.codeGraph,
                astSummaries: state.astSummaries,
                linterResults: state.linterResults,
            },
        })),
    ], "performance");

    return { performanceComments: parseComments(content) };
};
