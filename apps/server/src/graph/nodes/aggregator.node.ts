import type { PRReviewStateType, AgentComment } from "../review.state";

const SEVERITY_RANK: Record<AgentComment["severity"], number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
};

const MAX_COMMENTS = 12;

export const aggregateComments = (state: PRReviewStateType): Partial<PRReviewStateType> => {
    const all = state.verifiedComments;

    const seen = new Set<string>();
    const deduped = all.filter((c) => {
        const key = JSON.stringify([
            c.filePath,
            c.startLine ?? c.line,
            c.line,
            c.category,
            c.currentCode?.replace(/\r\n/g, "\n").replace(/\r/g, "\n") ?? "",
            c.body.trim(),
        ]);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const capped = deduped
        .map((comment) => ({
            ...comment,
            blocking: comment.severity === "CRITICAL" || comment.severity === "HIGH",
        }))
        .sort((a, b) =>
            SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
            || a.filePath.localeCompare(b.filePath)
            || a.line - b.line
            || a.category.localeCompare(b.category)
            || a.body.localeCompare(b.body)
        )
        .slice(0, MAX_COMMENTS);

    return { allComments: capped };
};
