export const reviewComment = (comment: {
    id: string;
    reviewSessionId: string;
    filePath: string;
    line: number;
    startLine: number | null;
    side: string;
    startSide: string | null;
    title: string | null;
    body: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    category: "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "REFACTOR" | "DOCUMENTATION" | "TEST" | "OTHER";
    suggestion: string | null;
    githubCommentId: bigint | null;
    createdAt: Date;
}) => ({
    ...comment,
    githubCommentId: comment.githubCommentId?.toString() ?? null,
});
