import "dotenv/config";
import { Worker } from "bullmq";
import { db } from "@repo/database";
import { reviewGraph } from "../../server/src/graph/review.graph";
import type { ReviewJobData } from "../../server/src/queue/review.queue";

const connection = {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
};

const worker = new Worker<ReviewJobData>(
    "github_pr_review",
    async (job) => {
        const data = job.data;
        console.log(`[worker] processing review session ${data.reviewSessionId} PR#${data.prNumber}`);

        try {
            await reviewGraph.invoke({
                reviewSessionId: data.reviewSessionId,
                repositoryId: data.repositoryId,
                githubInstallationId: data.githubInstallationId,
                prNumber: data.prNumber,
                headSha: data.headSha,
                baseBranch: data.baseBranch,
                owner: data.owner,
                repoName: data.repoName,
            });
        } catch (err) {
            console.error(`[worker] graph failed for session ${data.reviewSessionId}:`, err);
            await db.reviewSession.update({
                where: { id: data.reviewSessionId },
                data: { status: "FAILED", errorMessage: String(err), completedAt: new Date() },
            }).catch(() => {});
            throw err;
        }
    },
    {
        connection,
        concurrency: 3,
    }
);

worker.on("completed", (job) => {
    console.log(`[worker] job ${job.id} completed — session ${job.data.reviewSessionId}`);
});

worker.on("failed", (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
    console.error("[worker] worker error:", err);
});

console.log("[worker] started — listening on queue: github_pr_review");
