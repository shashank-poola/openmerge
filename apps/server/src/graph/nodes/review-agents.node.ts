import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../../llm/llm.provider";
import type { PRReviewStateType, AgentComment } from "../review.state";
import { CODE_REVIEW_SYSTEM, CODE_REVIEW_HUMAN } from "../../prompts/code-review.prompt";
import { SECURITY_SYSTEM, SECURITY_HUMAN } from "../../prompts/security.prompt";
import { PERFORMANCE_SYSTEM, PERFORMANCE_HUMAN } from "../../prompts/performance.prompt";

const MAX_DIFF_CHARS = 28000;

const truncateDiff = (diff: string): string => {
    if (diff.length <= MAX_DIFF_CHARS) return diff;
    return diff.slice(0, MAX_DIFF_CHARS) + "\n\n[diff truncated due to size]";
};

const parseComments = (raw: string): AgentComment[] => {
    try {
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return [];
        return JSON.parse(match[0]) as AgentComment[];
    } catch {
        return [];
    }
};

const buildParams = (state: PRReviewStateType) => ({
    prTitle: state.prTitle ?? `PR #${state.prNumber}`,
    changedFiles: state.changedFiles,
    diff: truncateDiff(state.diff ?? ""),
});

export const codeReviewAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const params = buildParams(state);
    const { content } = await invokeLLM([
        new SystemMessage(CODE_REVIEW_SYSTEM),
        new HumanMessage(CODE_REVIEW_HUMAN(params)),
    ], "codeReview");
    return { codeComments: parseComments(content) };
};

export const securityAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const params = buildParams(state);
    const { content } = await invokeLLM([
        new SystemMessage(SECURITY_SYSTEM),
        new HumanMessage(SECURITY_HUMAN(params)),
    ], "security");
    return { securityComments: parseComments(content) };
};

export const performanceAgent = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    if (!state.diff || state.error) return {};
    const params = buildParams(state);
    const { content } = await invokeLLM([
        new SystemMessage(PERFORMANCE_SYSTEM),
        new HumanMessage(PERFORMANCE_HUMAN(params)),
    ], "performance");
    return { performanceComments: parseComments(content) };
};
