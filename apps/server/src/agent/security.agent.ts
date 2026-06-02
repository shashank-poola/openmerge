import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
import { SECURITY_SYSTEM, SECURITY_HUMAN } from "../prompts/security.prompt";
import { parseAgentComments, type AgentInput, type AgentResult } from "./agent.types";

export const runSecurityAgent = async (input: AgentInput): Promise<AgentResult> => {
    const start = Date.now();
    try {
        const { content, provider } = await invokeLLM(
            [
                new SystemMessage(SECURITY_SYSTEM),
                new HumanMessage(SECURITY_HUMAN(input)),
            ],
            "security"
        );
        return {
            agentName: "securityAgent",
            comments: parseAgentComments(content),
            durationMs: Date.now() - start,
            provider,
        };
    } catch (err) {
        return {
            agentName: "securityAgent",
            comments: [],
            durationMs: Date.now() - start,
            provider: "groq",
            error: String(err),
        };
    }
};
