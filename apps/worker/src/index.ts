import { existsSync } from "fs";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { Worker } from "bullmq";
import type { ReviewJobData } from "../../server/src/queue/review.queue";
import { parseRedisUrl } from "./worker.utils";
import {
  REVIEW_STALE_AFTER_MS,
  processReviewJob,
  recoverReviewSessions,
} from "./review.worker";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPaths = [
  resolve(__dirname, "../.env.local"),
  resolve(__dirname, "../.env"),
  resolve(__dirname, "../../../.env.local"),
  resolve(__dirname, "../../../.env"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const connection = parseRedisUrl(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

const worker = new Worker<ReviewJobData>(
  "github_pr_review",
  (job) => processReviewJob(job),
  {
    connection,
    concurrency: 3,
    maxStalledCount: 1,
  },
);

const runRecovery = () => {
  void recoverReviewSessions().catch((error) => {
    console.error("[worker] recovery sweep failed:", error);
  });
};

const recoveryInterval = setInterval(runRecovery, Math.max(REVIEW_STALE_AFTER_MS, 30_000));

runRecovery();

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} completed — session ${job.data.reviewSessionId}`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker] job ${job?.id} failed:`, error.message);
});

worker.on("stalled", (jobId) => {
  console.warn(`[worker] job ${jobId} stalled and will be retried`);
});

worker.on("error", (error) => {
  console.error("[worker] error:", error);
});

const shutdown = async (signal: string) => {
  console.log(`[worker] received ${signal}, shutting down`);
  clearInterval(recoveryInterval);
  await worker.close();
  process.exit(0);
};

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

console.log("[worker] started — listening on queue: github_pr_review");
