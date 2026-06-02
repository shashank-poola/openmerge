import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
import { CODE_REVIEW_SYSTEM, CODE_REVIEW_HUMAN } from "../prompts/code-review.prompt";
import { parseAgentComments, type AgentInput, type AgentResult } from "./agent.types";

export const runCodeAgent = async (input: AgentInput): Promise<AgentResult> => {
    const start = Date.now();
    try {
        const { content, provider } = await invokeLLM(
            [
                new SystemMessage(CODE_REVIEW_SYSTEM),
                new HumanMessage(CODE_REVIEW_HUMAN(input)),
            ],
            "codeReview"
        );
        return {
            agentName: "codeAgent",
            comments: parseAgentComments(content),
            durationMs: Date.now() - start,
            provider,
        };
    } catch (err) {
        return {
            agentName: "codeAgent",
            comments: [],
            durationMs: Date.now() - start,
            provider: "groq",
            error: String(err),
        };
    }
};
