import type { Job } from "bullmq";
import { db } from "@repo/database";
import { reviewGraph } from "../../server/src/graph/review.graph";
import {
  buildReviewJobId,
  reviewQueue,
  type ReviewJobData,
} from "../../server/src/queue/review.queue";

export const REVIEW_TIMEOUT_MS = 15 * 60 * 1000;
export const REVIEW_STALE_AFTER_MS = REVIEW_TIMEOUT_MS + 60 * 1000;
export const REVIEW_HEARTBEAT_INTERVAL_MS = 15 * 1000;

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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

async function claimReviewSession(
  job: Job<ReviewJobData>,
  deps: ReviewWorkerDeps,
): Promise<boolean> {
  const now = deps.now();
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
      },
      data: { heartbeatAt: deps.now() },
    }).catch((error) => {
      console.error(`[worker] heartbeat failed for session ${job.data.reviewSessionId}:`, error);
    });
  }, REVIEW_HEARTBEAT_INTERVAL_MS);

  try {
    console.log(`[worker] processing session ${job.data.reviewSessionId} PR#${job.data.prNumber}`);

    const result = await withTimeout(
      deps.reviewGraph.invoke({
        reviewSessionId: job.data.reviewSessionId,
        repositoryId: job.data.repositoryId,
        githubInstallationId: job.data.githubInstallationId,
        prNumber: job.data.prNumber,
        headSha: job.data.headSha,
        baseBranch: job.data.baseBranch,
        owner: job.data.owner,
        repoName: job.data.repoName,
      }),
      REVIEW_TIMEOUT_MS,
      "Review processing timed out",
    );

    if (result.error) {
      throw new Error(result.error);
    }

    await deps.db.reviewSession.update({
      where: { id: job.data.reviewSessionId },
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const maxAttempts = job.opts.attempts ?? 1;
    const willRetry = job.attemptsMade + 1 < maxAttempts;

    await deps.db.reviewSession.update({
      where: { id: job.data.reviewSessionId },
      data: {
        status: willRetry ? "RETRYING" : "FAILED",
        errorMessage: message,
        lastErrorCode: message.includes("timed out") ? "REVIEW_TIMEOUT" : "REVIEW_PROCESSING_FAILED",
        completedAt: willRetry ? null : deps.now(),
        heartbeatAt: null,
        workerId: null,
      },
    });

    throw error;
  } finally {
    clearInterval(heartbeat);
  }
}

export async function recoverReviewSessions(
  deps: Pick<ReviewWorkerDeps, "db" | "reviewQueue"> = defaultDeps,
): Promise<void> {
  const staleBefore = new Date(Date.now() - REVIEW_STALE_AFTER_MS);

  await deps.db.reviewSession.updateMany({
    where: {
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

  const sessions = await deps.db.reviewSession.findMany({
    where: {
      status: { in: ["QUEUED", "RETRYING"] },
      headSha: { not: null },
    },
    include: {
      repository: {
        include: { installation: true },
      },
    },
    take: 50,
  });

  for (const session of sessions) {
    if (!session.headSha) continue;

    if (session.jobId) {
      const existingJob = await deps.reviewQueue.getJob(session.jobId);
      if (existingJob) continue;

      await deps.db.reviewSession.updateMany({
        where: { id: session.id, jobId: session.jobId },
        data: { jobId: null },
      });
    }

    const attempt = session.attemptCount + 1;
    const jobId = buildReviewJobId(session.id, attempt);
    const jobData: ReviewJobData = {
      reviewSessionId: session.id,
      reviewKey: session.reviewKey ?? `${session.repository.id}:${session.prNumber}:${session.headSha}`,
      repositoryId: session.repository.id,
      githubInstallationId: session.repository.installation.githubInstallationId.toString(),
      prNumber: session.prNumber,
      headSha: session.headSha,
      baseBranch: session.baseBranch,
      owner: session.repository.owner,
      repoName: session.repository.name,
    };

    try {
      await deps.reviewQueue.add("review", jobData, { jobId });
      await deps.db.reviewSession.updateMany({
        where: { id: session.id, jobId: null },
        data: { jobId },
      });
      console.log(`[worker] recovered review session ${session.id}`);
    } catch (error) {
      console.error(`[worker] failed to recover review session ${session.id}:`, error);
    }
  }
}
