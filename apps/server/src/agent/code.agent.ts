import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { groq } from "../config/llm.config";
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
        const response = await groq.invoke([
            new SystemMessage(CODE_REVIEW_SYSTEM),
            new HumanMessage(CODE_REVIEW_HUMAN(input)),
        ]);
        return {
            agentName: "codeAgent",
            comments: parseComments(response.content as string),
            durationMs: Date.now() - start,
        };
    } catch (err) {
        return { agentName: "codeAgent", comments: [], durationMs: Date.now() - start, error: String(err) };
    }
};
