import type { AgentComment, LinterIssue, CodeGraphNode, ASTSummary, ImportSource, PRHistoryEntry } from "../types/review-context.type";

export type AgentInput = {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    context: {
        linterResults: LinterIssue[];
        codeGraph: CodeGraphNode[];
        astSummaries: ASTSummary[];
        importSources: ImportSource[];
        prHistory: PRHistoryEntry[];
    };
};

export type AgentResult = {
    agentName: string;
    comments: AgentComment[];
    durationMs: number;
    provider: "openrouter" | "groq";
    error?: string;
};

export const parseAgentComments = (raw: string): AgentComment[] => {
    try {
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return [];
        return JSON.parse(match[0]) as AgentComment[];
    } catch {
        return [];
    }
};
