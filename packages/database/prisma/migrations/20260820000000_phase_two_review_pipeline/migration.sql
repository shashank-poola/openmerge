-- Add retry-aware review processing state.
ALTER TYPE "ReviewStatus" ADD VALUE 'RETRYING';

-- Add durable review identity and worker lifecycle fields.
ALTER TABLE "ReviewSession"
  ADD COLUMN "reviewKey" TEXT,
  ADD COLUMN "jobId" TEXT,
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastErrorCode" TEXT,
  ADD COLUMN "workerId" TEXT,
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "heartbeatAt" TIMESTAMP(3);

-- Existing running work cannot be safely resumed without a worker heartbeat.
UPDATE "ReviewSession"
SET
  "status" = 'RETRYING',
  "lastErrorCode" = 'MIGRATION_RESTART_REQUIRED',
  "errorMessage" = 'Review was made retryable during the Phase 2 migration',
  "workerId" = NULL,
  "heartbeatAt" = NULL,
  "jobId" = NULL
WHERE "status" = 'RUNNING';

-- Backfill deterministic keys while leaving duplicate historical rows nullable.
WITH ranked_sessions AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "repositoryId", "prNumber", "headSha"
      ORDER BY "createdAt" DESC, "id" DESC
    ) AS rank
  FROM "ReviewSession"
  WHERE "headSha" IS NOT NULL
)
UPDATE "ReviewSession" AS session
SET "reviewKey" = CASE
  WHEN ranked.rank = 1 THEN CONCAT(session."repositoryId", ':', session."prNumber", ':', session."headSha")
  ELSE NULL
END
FROM ranked_sessions AS ranked
WHERE session."id" = ranked."id";

CREATE UNIQUE INDEX "ReviewSession_reviewKey_key" ON "ReviewSession"("reviewKey");
CREATE UNIQUE INDEX "ReviewSession_jobId_key" ON "ReviewSession"("jobId");
CREATE INDEX "ReviewSession_status_heartbeatAt_idx" ON "ReviewSession"("status", "heartbeatAt");

-- Record GitHub deliveries so webhook retries are idempotent.
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

CREATE TABLE "WebhookDelivery" (
  "id" TEXT NOT NULL,
  "deliveryId" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'RECEIVED',
  "errorMessage" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),

  CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookDelivery_deliveryId_key" ON "WebhookDelivery"("deliveryId");
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");
CREATE INDEX "WebhookDelivery_receivedAt_idx" ON "WebhookDelivery"("receivedAt");

-- Make persisted review comments idempotent across worker retries.
ALTER TABLE "ReviewComment" ADD COLUMN "commentKey" TEXT;
CREATE UNIQUE INDEX "ReviewComment_commentKey_key" ON "ReviewComment"("commentKey");
