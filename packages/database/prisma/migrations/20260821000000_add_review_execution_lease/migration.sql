-- Fence each review execution independently from its stable queue job.
ALTER TABLE "ReviewSession" ADD COLUMN "leaseId" TEXT;
CREATE UNIQUE INDEX "ReviewSession_leaseId_key" ON "ReviewSession"("leaseId");
