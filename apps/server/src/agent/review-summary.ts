import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { AgentComment } from "../types/review-context.type";
import { invokeLLM } from "../llm/llm.provider";
import { agentTrace, type LLMTraceOptions } from "../llm/llm.trace";

export type ReviewSummary = {
    overview: string;
    bullets: string[];
    mergeAssessment: string;
    mergeReason: string;
};

const SUMMARY_SYSTEM = `You write a concise, evidence-based pull request summary for a code review.

Return only valid JSON with exactly these fields:
{
  "overview": "one or two sentences describing what this PR changes",
  "bullets": ["two to four concrete changes"],
  "mergeAssessment": "one sentence explaining whether the PR is safe to merge",
  "mergeReason": "one sentence explaining the most important reason"
}

Use only the supplied PR title, changed files, diff, and findings. Do not invent tests, requirements, or files.
If findings are blocking, say that the PR is not yet safe to merge. If there are no findings, say that no actionable issues were detected.
Keep every field short and professional. Do not mention being an AI or generating a review.`;

const MAX_DIFF_CHARS = 14_000;

const extractJsonObject = (raw: string): unknown => {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return null;

    try {
        return JSON.parse(raw.slice(start, end + 1));
    } catch {
        return null;
    }
};

const parseReviewSummary = (raw: string): ReviewSummary | null => {
    const value = extractJsonObject(raw);
    if (!value || typeof value !== "object") return null;

    const candidate = value as Record<string, unknown>;
    const overview = typeof candidate.overview === "string" ? candidate.overview.trim() : "";
    const mergeAssessment = typeof candidate.mergeAssessment === "string"
        ? candidate.mergeAssessment.trim()
        : "";
    const mergeReason = typeof candidate.mergeReason === "string" ? candidate.mergeReason.trim() : "";
    const bullets = Array.isArray(candidate.bullets)
        ? candidate.bullets.filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 4)
        : [];

    if (!overview || !mergeAssessment || !mergeReason || bullets.length === 0) return null;
    return { overview, bullets, mergeAssessment, mergeReason };
};

export const generateReviewSummary = async (params: {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    comments: AgentComment[];
    trace?: LLMTraceOptions;
}): Promise<ReviewSummary | null> => {
    const findings = params.comments.map((comment) => ({
        filePath: comment.filePath,
        line: comment.line,
        severity: comment.severity,
        category: comment.category,
        blocking: comment.blocking,
        body: comment.body,
    }));

    const prompt = [
        `PR title: ${params.prTitle}`,
        `Changed files: ${params.changedFiles.join(", ")}`,
        `Findings: ${JSON.stringify(findings)}`,
        `Diff:\n${params.diff.slice(0, MAX_DIFF_CHARS)}`,
    ].join("\n\n");

    try {
        const result = await invokeLLM([
            new SystemMessage(SUMMARY_SYSTEM),
            new HumanMessage(prompt),
        ], "summary", agentTrace("reviewSummary", "agent:summary", params.trace));
        return parseReviewSummary(result.content);
    } catch (error) {
        console.warn("Could not generate PR summary:", error instanceof Error ? error.message : String(error));
        return null;
    }
};
