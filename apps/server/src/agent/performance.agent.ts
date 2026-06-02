import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
import { PERFORMANCE_SYSTEM, PERFORMANCE_HUMAN } from "../prompts/performance.prompt";
import { parseAgentComments, type AgentInput, type AgentResult } from "./agent.types";

export const runPerformanceAgent = async (input: AgentInput): Promise<AgentResult> => {
    const start = Date.now();
    try {
        const { content, provider } = await invokeLLM(
            [
                new SystemMessage(PERFORMANCE_SYSTEM),
                new HumanMessage(PERFORMANCE_HUMAN(input)),
            ],
            "performance"
        );
        return {
            agentName: "performanceAgent",
            comments: parseAgentComments(content),
            durationMs: Date.now() - start,
            provider,
        };
    } catch (err) {
        return {
            agentName: "performanceAgent",
            comments: [],
            durationMs: Date.now() - start,
            provider: "groq",
            error: String(err),
        };
    }
};
