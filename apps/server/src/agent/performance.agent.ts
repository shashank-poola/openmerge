import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { groq } from "../config/llm.config";
import { PERFORMANCE_SYSTEM, PERFORMANCE_HUMAN } from "../prompts/performance.prompt";
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

export const runPerformanceAgent = async (input: AgentInput): Promise<AgentResult> => {
    const start = Date.now();
    try {
        const response = await groq.invoke([
            new SystemMessage(PERFORMANCE_SYSTEM),
            new HumanMessage(PERFORMANCE_HUMAN(input)),
        ]);
        return {
            agentName: "performanceAgent",
            comments: parseComments(response.content as string),
            durationMs: Date.now() - start,
        };
    } catch (err) {
        return { agentName: "performanceAgent", comments: [], durationMs: Date.now() - start, error: String(err) };
    }
};
