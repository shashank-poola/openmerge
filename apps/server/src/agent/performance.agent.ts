import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
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
        const { content, provider } = await invokeLLM([
            new SystemMessage(PERFORMANCE_SYSTEM),
            new HumanMessage(PERFORMANCE_HUMAN(input)),
        ], "performance");
        return {
            agentName: "performanceAgent",
            comments: parseComments(content),
            durationMs: Date.now() - start,
            provider,
        };
    } catch (err) {
        return { agentName: "performanceAgent", comments: [], durationMs: Date.now() - start, error: String(err) };
    }
};
