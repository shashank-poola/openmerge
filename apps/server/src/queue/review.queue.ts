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

const parseRedisUrl = (url: string) => {
    try {
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
    } catch (error) {
        if (error instanceof Error && error.message.startsWith("Unsupported Redis protocol:")) {
            throw error;
        }
        return { host: "127.0.0.1", port: 6379, lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: null };
    }
};

const connection = parseRedisUrl(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

export const reviewQueue = new Queue<ReviewJobData>("github_pr_review", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: 100,
        removeOnFail: false,
    },
});

reviewQueue.on("error", (err) => {
    console.error("[queue] Redis connection error:", err.message);
});
