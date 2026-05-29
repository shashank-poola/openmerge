import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
import { CODE_REVIEW_SYSTEM, CODE_REVIEW_HUMAN } from "../prompts/code-review.prompt";
import type { AgentInput, AgentResult } from "./agent.types";
import type { AgentComment } from "../graph/review.state";

const parseComments = (raw: string): AgentComment[] => {
    try {
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return [];
        return JSON.parse(match[0]) as AgentComment[];
    } catch {
        return [];
    }
};

export const runCodeAgent = async (input: AgentInput): Promise<AgentResult> => {
    const start = Date.now();
    try {
        const { content, provider } = await invokeLLM([
            new SystemMessage(CODE_REVIEW_SYSTEM),
            new HumanMessage(CODE_REVIEW_HUMAN(input)),
        ], "codeReview");
        return {
            agentName: "codeAgent",
            comments: parseComments(content),
            durationMs: Date.now() - start,
            provider,
        };
    } catch (err) {
        return { agentName: "codeAgent", comments: [], durationMs: Date.now() - start, error: String(err) };
    }
};
