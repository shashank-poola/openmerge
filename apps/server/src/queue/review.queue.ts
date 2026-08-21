import { Queue } from "bullmq";

export type ReviewJobData = {
    reviewSessionId: string;
    reviewKey: string;
    repositoryId: string;
    githubInstallationId: string;
    prNumber: number;
    headSha: string;
    baseBranch: string;
    owner: string;
    repoName: string;
};

export const buildReviewJobId = (reviewSessionId: string, attempt: number) =>
    `review:${reviewSessionId}:attempt:${attempt}`;

export const MAX_REVIEW_ATTEMPTS = 10;

const parseRedisUrl = (url: string) => {
    const parsed = new URL(url);
    if (parsed.protocol !== "redis:" && parsed.protocol !== "rediss:") {
        throw new Error(`Unsupported Redis protocol: ${parsed.protocol}`);
    }

    const username = parsed.username ? decodeURIComponent(parsed.username) : "";
    return {
        host: parsed.hostname || "127.0.0.1",
        port: Number(parsed.port) || 6379,
        ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
        ...(username && username !== "default" ? { username } : {}),
        ...(parsed.protocol === "rediss:" ? { tls: {} } : {}),
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: null,
    };
};

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const connection = parseRedisUrl(redisUrl);

export const reviewQueue = new Queue<ReviewJobData>("github_pr_review", {
    connection,
    defaultJobOptions: {
        attempts: MAX_REVIEW_ATTEMPTS,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: 100,
        removeOnFail: { count: 200, age: 7 * 24 * 60 * 60 },
    },
});

reviewQueue.on("error", (err) => {
    console.error("[queue] Redis connection error:", err.message);
});
