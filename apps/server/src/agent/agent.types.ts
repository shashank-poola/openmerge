import { z } from "zod";
import { isBlockingSeverity } from "./finding.policy";
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
    outputStatus: AgentOutputStatus;
    durationMs: number;
    provider: "groq" | "gemini";
    error?: string;
};

export type Specialist = "code" | "security" | "performance";
export type AgentOutputStatus = "valid" | "partial" | "invalid";

export type ParseAgentCommentsResult = {
    status: AgentOutputStatus;
    comments: AgentComment[];
    invalidCount: number;
};

const MAX_RAW_OUTPUT_CHARS = 100_000;

const specialistLimits: Record<Specialist, number> = {
    code: 8,
    security: 6,
    performance: 5,
};

const specialistCategories: Record<Specialist, AgentComment["category"]> = {
    code: "BUG",
    security: "SECURITY",
    performance: "PERFORMANCE",
};

const isRepositoryRelativePath = (value: string): boolean => {
    if (!value || value !== value.trim() || value.length > 512 || value.startsWith("/") || value.includes("\\") || value.includes("\0")) {
        return false;
    }

    return value.split("/").every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
};

const boundedText = (maximum: number) =>
    z.string().min(1).max(maximum).refine((value) => value.trim().length > 0, "Must not be whitespace only");

const agentCommentSchema = z
    .object({
        filePath: z.string().refine(isRepositoryRelativePath, "Must be a repository-relative path"),
        line: z.number().int().positive().max(1_000_000),
        startLine: z.number().int().positive().max(1_000_000).optional(),
        body: boundedText(4_000),
        severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
        category: z.enum(["BUG", "SECURITY", "PERFORMANCE", "STYLE", "REFACTOR", "DOCUMENTATION", "TEST", "OTHER"]),
        currentCode: boundedText(2_000),
        suggestion: boundedText(4_000),
        blocking: z.boolean(),
    })
    .strict()
    .superRefine((comment, context) => {
        if (comment.startLine !== undefined && comment.startLine > comment.line) {
            context.addIssue({
                code: "custom",
                path: ["startLine"],
                message: "Must not be after line",
            });
        }
    });

export const parseAgentComments = (
    raw: string,
    specialist: Specialist
): ParseAgentCommentsResult => {
    if (raw.length > MAX_RAW_OUTPUT_CHARS) {
        return { status: "invalid", comments: [], invalidCount: 1 };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { status: "invalid", comments: [], invalidCount: 1 };
    }

    if (!Array.isArray(parsed)) {
        return { status: "invalid", comments: [], invalidCount: 1 };
    }

    const comments: AgentComment[] = [];
    let invalidCount = 0;

    for (const [index, candidate] of parsed.entries()) {
        if (index >= specialistLimits[specialist]) {
            invalidCount += 1;
            continue;
        }

        const result = agentCommentSchema.safeParse(candidate);
        if (!result.success || result.data.category !== specialistCategories[specialist]) {
            invalidCount += 1;
            continue;
        }

        comments.push({
            ...result.data,
            blocking: isBlockingSeverity(result.data.severity),
        });
    }

    if (invalidCount === 0) {
        return { status: "valid", comments, invalidCount };
    }

    return {
        status: comments.length > 0 ? "partial" : "invalid",
        comments,
        invalidCount,
    };
};
