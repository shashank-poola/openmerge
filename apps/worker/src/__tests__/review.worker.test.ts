import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Job } from "bullmq";
import type { ReviewJobData } from "../../../server/src/queue/review.queue";
import { processReviewJob } from "../review.worker";
import { recoverReviewSessions } from "../review.recovery";

type RecoverySessionFixture = {
  id: string;
  reviewKey: string | null;
  repositoryId: string;
  prNumber: number;
  headSha: string | null;
  baseBranch: string;
  attemptCount: number;
  jobId: string | null;
  repository: {
    id: string;
    owner: string;
    name: string;
    isActive: boolean;
    autoReviewEnabled: boolean;
    installation: { githubInstallationId: bigint; status: "ACTIVE" | "SUSPENDED" | "REMOVED" };
  };
};

const reviewGraphInvokeMock = mock(async () => ({
  error: null,
  changedFiles: ["src/index.ts"],
  allComments: [{ filePath: "src/index.ts" }],
}));
const sessionUpdateManyMock = mock(async () => ({ count: 1 }));
const sessionFindUniqueMock = mock(async () => ({
  status: "COMPLETED" as const,
  heartbeatAt: null,
}));
const sessionUpdateMock = mock(async () => ({ id: "session-1" }));
const sessionFindManyMock = mock<() => Promise<RecoverySessionFixture[]>>(async () => []);
const queueAddMock = mock(async () => undefined);
const queueGetJobMock = mock(async () => undefined);

const jobData: ReviewJobData = {
  reviewSessionId: "session-1",
  reviewKey: "repo-1:42:sha-1",
  repositoryId: "repo-1",
  githubInstallationId: "installation-1",
  prNumber: 42,
  headSha: "sha-1",
  baseBranch: "main",
  owner: "octocat",
  repoName: "hello-world",
};

function createJob(overrides: Partial<Job<ReviewJobData>> = {}) {
  return {
    id: "review:session-1:attempt:1",
    data: jobData,
    attemptsMade: 0,
    opts: { attempts: 3 },
    ...overrides,
  } as unknown as Job<ReviewJobData>;
}

function createDeps() {
  return {
    db: {
      reviewSession: {
        updateMany: sessionUpdateManyMock,
        findUnique: sessionFindUniqueMock,
        update: sessionUpdateMock,
        findMany: sessionFindManyMock,
      },
    },
    reviewQueue: {
      add: queueAddMock,
      getJob: queueGetJobMock,
    },
    reviewGraph: {
      invoke: reviewGraphInvokeMock,
    },
    workerId: "test-worker",
    now: () => new Date("2026-08-20T12:00:00.000Z"),
  } as unknown as Parameters<typeof processReviewJob>[1];
}

beforeEach(() => {
  reviewGraphInvokeMock.mockReset();
  reviewGraphInvokeMock.mockResolvedValue({
    error: null,
    changedFiles: ["src/index.ts"],
    allComments: [{ filePath: "src/index.ts" }],
  });
  sessionUpdateManyMock.mockReset();
  sessionUpdateManyMock.mockResolvedValue({ count: 1 });
  sessionFindUniqueMock.mockReset();
  sessionFindUniqueMock.mockResolvedValue({ status: "COMPLETED", heartbeatAt: null });
  sessionUpdateMock.mockClear();
  sessionFindManyMock.mockReset();
  sessionFindManyMock.mockResolvedValue([]);
  queueAddMock.mockClear();
  queueGetJobMock.mockReset();
  queueGetJobMock.mockResolvedValue(undefined);
});

describe("processReviewJob", () => {
  test("claims a queued session and marks it completed after the graph succeeds", async () => {
    await processReviewJob(createJob(), createDeps());

    expect(reviewGraphInvokeMock).toHaveBeenCalledTimes(1);
    expect(sessionUpdateManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "session-1", status: { in: ["QUEUED", "RETRYING"] } },
      data: expect.objectContaining({ status: "RUNNING", workerId: "test-worker" }),
    }));
    expect(sessionUpdateManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "session-1", status: "RUNNING", workerId: "test-worker" }),
      data: expect.objectContaining({ status: "COMPLETED", filesReviewed: 1, totalComments: 1 }),
    }));
  });

  test("records a retryable failure and rethrows for BullMQ", async () => {
    reviewGraphInvokeMock.mockRejectedValueOnce(new Error("provider timeout"));

    await expect(processReviewJob(createJob(), createDeps())).rejects.toThrow("provider timeout");

    expect(sessionUpdateManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "session-1", status: "RUNNING", workerId: "test-worker" }),
      data: expect.objectContaining({
        status: "RETRYING",
        lastErrorCode: "REVIEW_PROCESSING_FAILED",
        errorMessage: "provider timeout",
      }),
    }));
  });

  test("does not process a session that was already completed", async () => {
    sessionUpdateManyMock.mockResolvedValueOnce({ count: 0 });
    sessionFindUniqueMock.mockResolvedValueOnce({ status: "COMPLETED", heartbeatAt: null });

    await processReviewJob(createJob(), createDeps());

    expect(reviewGraphInvokeMock).not.toHaveBeenCalled();
    expect(sessionUpdateMock).not.toHaveBeenCalled();
  });
});

describe("recoverReviewSessions", () => {
  test("requeues queued sessions that do not have a live job", async () => {
    sessionFindManyMock.mockResolvedValueOnce([{
      id: "session-2",
      reviewKey: "repo-2:7:sha-2",
      repositoryId: "repo-2",
      prNumber: 7,
      headSha: "sha-2",
      baseBranch: "main",
      attemptCount: 0,
      jobId: null,
      repository: {
        id: "repo-2",
        owner: "octocat",
        name: "second-repo",
        isActive: true,
        autoReviewEnabled: true,
        installation: { githubInstallationId: 456n, status: "ACTIVE" },
      },
    }]);

    await recoverReviewSessions(createDeps());

    expect(queueAddMock).toHaveBeenCalledWith(
      "review",
      expect.objectContaining({ reviewSessionId: "session-2", reviewKey: "repo-2:7:sha-2" }),
      { jobId: "review:session-2:attempt:1" },
    );
  });
});
