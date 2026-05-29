import type { AgentComment } from "../graph/review.state";

export type AgentInput = {
    prTitle: string;
    prNumber: number;
    diff: string;
    changedFiles: string[];
};

export type AgentResult = {
    comments: AgentComment[];
    agentName: string;
    durationMs: number;
    error?: string;
};

export type Agent = (input: AgentInput) => Promise<AgentResult>;
