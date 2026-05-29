import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { invokeLLM } from "../llm/llm.provider";
import { SECURITY_SYSTEM, SECURITY_HUMAN } from "../prompts/security.prompt";
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

export const runSecurityAgent = async (input: AgentInput): Promise<AgentResult> => {
    const start = Date.now();
    try {
        const { content, provider } = await invokeLLM([
            new SystemMessage(SECURITY_SYSTEM),
            new HumanMessage(SECURITY_HUMAN(input)),
        ], "security");
        return {
            agentName: "securityAgent",
            comments: parseComments(content),
            durationMs: Date.now() - start,
            provider,
        };
    } catch (err) {
        return { agentName: "securityAgent", comments: [], durationMs: Date.now() - start, error: String(err) };
    }
};
