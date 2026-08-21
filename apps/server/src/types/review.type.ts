export const reviewSession = (session: {
    id: string;
    repositoryId: string;
    prNumber: number;
    headSha: string | null;
    baseBranch: string;
    status: "QUEUED" | "RUNNING" | "RETRYING" | "COMPLETED" | "FAILED";
    summary: string | null;
    filesReviewed: number;
    totalComments: number;
    githubReviewId: bigint | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}) => ({
    ...session,
    githubReviewId: session.githubReviewId?.toString() ?? null,
});

