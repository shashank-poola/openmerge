import { Queue } from "bullmq";

export type ReviewJobData = {
    reviewSessionId: string;
    repositoryId: string;
    githubInstallationId: string;
    prNumber: number;
    headSha: string;
    baseBranch: string;
    owner: string;
    repoName: string;
};

const connection = {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
};

export const reviewQueue = new Queue<ReviewJobData>("github_pr_review", {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: 100,
        removeOnFail: 200,
    },
});
