import { db } from "@repo/database";
import {
  buildReviewJobId,
  MAX_REVIEW_ATTEMPTS,
  reviewQueue,
  type ReviewJobData,
} from "../../server/src/queue/review.queue";
import {
  REVIEW_RECOVERY_INTERVAL_MS,
  REVIEW_STALE_AFTER_MS,
} from "./review.constants";

const WEBHOOK_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

type RecoveryDb = Pick<typeof db, "reviewSession" | "webhookDelivery">;
type RecoveryQueue = Pick<typeof reviewQueue, "add" | "getJob">;

type RecoveryDeps = {
  db: RecoveryDb;
  reviewQueue: RecoveryQueue;
};

const defaultDeps: RecoveryDeps = { db, reviewQueue };

export async function recoverReviewSessions(
  deps: RecoveryDeps = defaultDeps,
): Promise<void> {
  const now = Date.now();
  const staleBefore = new Date(now - REVIEW_STALE_AFTER_MS);
  const recoveryCutoff = new Date(now - REVIEW_RECOVERY_INTERVAL_MS);

  try {
    await deps.db.webhookDelivery.deleteMany({
      where: {
        receivedAt: { lt: new Date(now - WEBHOOK_RETENTION_MS) },
        status: { in: ["PROCESSED", "IGNORED"] },
      },
    });
  } catch (error) {
    console.error("[worker] webhook delivery retention sweep failed:", error);
  }

  await deps.db.reviewSession.updateMany({
    where: {
      status: "RUNNING",
      heartbeatAt: { lt: staleBefore },
    },
    data: {
      status: "RETRYING",
      jobId: null,
      leaseId: null,
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
      createdAt: { lt: recoveryCutoff },
    },
    include: {
      repository: {
        include: { installation: true },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  for (const session of sessions) {
    if (!session.headSha) continue;
    if (!session.repository.isActive || !session.repository.autoReviewEnabled) continue;
    if (session.repository.installation.status !== "ACTIVE") continue;

    if (session.attemptCount >= MAX_REVIEW_ATTEMPTS) {
      await deps.db.reviewSession.updateMany({
        where: { id: session.id, status: { in: ["QUEUED", "RETRYING"] } },
        data: {
          status: "FAILED",
          lastErrorCode: "REVIEW_RECOVERY_EXHAUSTED",
          errorMessage: "Review recovery attempt limit exceeded",
          completedAt: new Date(),
        },
      });
      continue;
    }

    const attempt = session.attemptCount + 1;
    if (session.jobId) {
      const existingJob = await deps.reviewQueue.getJob(session.jobId);
      if (existingJob) {
        const state = await existingJob.getState();
        const isLive = state === "waiting"
          || state === "active"
          || state === "delayed"
          || state === "prioritized"
          || state === "waiting-children";
        if (isLive) continue;

        await deps.db.reviewSession.updateMany({
          where: { id: session.id, jobId: session.jobId },
          data: { jobId: null, leaseId: null },
        });
      } else {
        await deps.db.reviewSession.updateMany({
          where: { id: session.id, jobId: session.jobId },
          data: { jobId: null, leaseId: null },
        });
      }
    }

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
        data: { jobId, leaseId: null },
      });
      console.log(`[worker] recovered review session ${session.id}`);
    } catch (error) {
      console.error(`[worker] failed to recover review session ${session.id}:`, error);
    }
  }
}
