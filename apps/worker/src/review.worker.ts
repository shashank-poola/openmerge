import type { Job } from "bullmq";
import { db } from "@repo/database";
import { reviewGraph } from "../../server/src/graph/review.graph";
import {
  buildReviewJobId,
  reviewQueue,
  type ReviewJobData,
} from "../../server/src/queue/review.queue";
import {
  REVIEW_HEARTBEAT_INTERVAL_MS,
  REVIEW_STALE_AFTER_MS,
  REVIEW_TIMEOUT_MS,
} from "./review.constants";

export { REVIEW_HEARTBEAT_INTERVAL_MS, REVIEW_STALE_AFTER_MS, REVIEW_TIMEOUT_MS } from "./review.constants";

const workerId = process.env.HOSTNAME ?? `worker-${process.pid}`;

type WorkerDb = Pick<typeof db, "reviewSession">;
type WorkerQueue = Pick<typeof reviewQueue, "add" | "getJob">;
type WorkerGraph = Pick<typeof reviewGraph, "invoke">;

type ReviewWorkerDeps = {
  db: WorkerDb;
  reviewQueue: WorkerQueue;
  reviewGraph: WorkerGraph;
  workerId: string;
  now: () => Date;
};

const defaultDeps: ReviewWorkerDeps = {
  db,
  reviewQueue,
  reviewGraph,
  workerId,
  now: () => new Date(),
};

function withTimeout<T>(
  task: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort(new Error(message));
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([task(controller.signal), timeoutPromise]).finally(() => {
    clearTimeout(timeout);
    controller.abort();
  });
}

async function claimReviewSession(
  job: Job<ReviewJobData>,
  deps: ReviewWorkerDeps,
): Promise<boolean> {
  const now = deps.now();
  const jobId = String(job.id ?? buildReviewJobId(job.data.reviewSessionId, job.attemptsMade + 1));
  const claim = await deps.db.reviewSession.updateMany({
    where: {
      id: job.data.reviewSessionId,
      status: { in: ["QUEUED", "RETRYING"] },
    },
    data: {
      status: "RUNNING",
      attemptCount: { increment: 1 },
      startedAt: now,
      heartbeatAt: now,
      workerId: deps.workerId,
      jobId,
      errorMessage: null,
      lastErrorCode: null,
      completedAt: null,
    },
  });

  if (claim.count > 0) return true;

  const current = await deps.db.reviewSession.findUnique({
    where: { id: job.data.reviewSessionId },
    select: { status: true, heartbeatAt: true },
  });

  if (current?.status === "COMPLETED" || current?.status === "FAILED") return false;
  if (current?.status !== "RUNNING" || !current.heartbeatAt) return false;

  const staleBefore = new Date(now.getTime() - REVIEW_STALE_AFTER_MS);
  const recovered = await deps.db.reviewSession.updateMany({
    where: {
      id: job.data.reviewSessionId,
      status: "RUNNING",
      heartbeatAt: { lt: staleBefore },
    },
    data: {
      status: "RETRYING",
      jobId: null,
      workerId: null,
      heartbeatAt: null,
      lastErrorCode: "WORKER_HEARTBEAT_TIMEOUT",
      errorMessage: "Previous worker stopped sending heartbeats",
    },
  });

  if (recovered.count === 0) return false;

  const retryClaim = await deps.db.reviewSession.updateMany({
    where: {
      id: job.data.reviewSessionId,
      status: "RETRYING",
    },
    data: {
      status: "RUNNING",
      attemptCount: { increment: 1 },
      startedAt: now,
      heartbeatAt: now,
      workerId: deps.workerId,
      jobId,
      errorMessage: null,
      lastErrorCode: null,
      completedAt: null,
    },
  });

  return retryClaim.count > 0;
}

export async function processReviewJob(
  job: Job<ReviewJobData>,
  deps: ReviewWorkerDeps = defaultDeps,
): Promise<void> {
  const claimed = await claimReviewSession(job, deps);
  if (!claimed) return;

  const heartbeat = setInterval(() => {
    void deps.db.reviewSession.updateMany({
      where: {
        id: job.data.reviewSessionId,
        status: "RUNNING",
        workerId: deps.workerId,
        jobId: String(job.id ?? buildReviewJobId(job.data.reviewSessionId, job.attemptsMade + 1)),
      },
      data: { heartbeatAt: deps.now() },
    }).catch((error) => {
      console.error(`[worker] heartbeat failed for session ${job.data.reviewSessionId}:`, error);
    });
  }, REVIEW_HEARTBEAT_INTERVAL_MS);

  try {
    console.log(`[worker] processing session ${job.data.reviewSessionId} PR#${job.data.prNumber}`);

    const result = await withTimeout(
      (signal) => deps.reviewGraph.invoke({
        reviewSessionId: job.data.reviewSessionId,
        repositoryId: job.data.repositoryId,
        jobId: String(job.id ?? buildReviewJobId(job.data.reviewSessionId, job.attemptsMade + 1)),
        workerId: deps.workerId,
        githubInstallationId: job.data.githubInstallationId,
        prNumber: job.data.prNumber,
        headSha: job.data.headSha,
        baseBranch: job.data.baseBranch,
        owner: job.data.owner,
        repoName: job.data.repoName,
      }, { signal }),
      REVIEW_TIMEOUT_MS,
      "Review processing timed out",
    );

    if (result.error === "REVIEW_OWNERSHIP_LOST") {
      console.warn(`[worker] ownership lost before posting session ${job.data.reviewSessionId}`);
      return;
    }

    if (result.error) {
      throw new Error(result.error);
    }

    const jobId = String(job.id ?? buildReviewJobId(job.data.reviewSessionId, job.attemptsMade + 1));
    const completed = await deps.db.reviewSession.updateMany({
      where: {
        id: job.data.reviewSessionId,
        status: "RUNNING",
        workerId: deps.workerId,
        jobId,
      },
      data: {
        status: "COMPLETED",
        filesReviewed: result.changedFiles.length,
        totalComments: result.allComments.length,
        completedAt: deps.now(),
        heartbeatAt: null,
        workerId: null,
        lastErrorCode: null,
        errorMessage: null,
      },
    });

    if (completed.count === 0) {
      console.warn(`[worker] ownership lost before completing session ${job.data.reviewSessionId}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const maxAttempts = job.opts.attempts ?? 1;
    const willRetry = job.attemptsMade + 1 < maxAttempts;

    const jobId = String(job.id ?? buildReviewJobId(job.data.reviewSessionId, job.attemptsMade + 1));
    const updated = await deps.db.reviewSession.updateMany({
      where: {
        id: job.data.reviewSessionId,
        status: "RUNNING",
        workerId: deps.workerId,
        jobId,
      },
      data: {
        status: willRetry ? "RETRYING" : "FAILED",
        errorMessage: message,
        lastErrorCode: message.includes("timed out") ? "REVIEW_TIMEOUT" : "REVIEW_PROCESSING_FAILED",
        completedAt: willRetry ? null : deps.now(),
        heartbeatAt: null,
        workerId: null,
      },
    });

    if (updated.count === 0) {
      console.warn(`[worker] ownership lost while recording failure for session ${job.data.reviewSessionId}`);
    }

    throw error;
  } finally {
    clearInterval(heartbeat);
  }
}
