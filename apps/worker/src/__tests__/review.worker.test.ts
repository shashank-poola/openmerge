import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Job } from "bullmq";
import { MAX_REVIEW_ATTEMPTS, type ReviewJobData } from "../../../server/src/queue/review.queue";
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

type ReviewGraphTestInput = { leaseId: string };
type ReviewGraphTestResult = {
  error: string | null;
  changedFiles: string[];
  allComments: Array<{ filePath: string }>;
};

const reviewGraphInvokeMock = mock<(input: ReviewGraphTestInput) => Promise<ReviewGraphTestResult>>(
  async (_input) => ({
    error: null,
    changedFiles: ["src/index.ts"],
    allComments: [{ filePath: "src/index.ts" }],
  }),
);
const sessionUpdateManyMock = mock(async () => ({ count: 1 }));
const sessionFindUniqueMock = mock(async () => ({
  status: "COMPLETED" as const,
  heartbeatAt: null,
}));
const sessionUpdateMock = mock(async () => ({ id: "session-1" }));
const sessionFindManyMock = mock<() => Promise<RecoverySessionFixture[]>>(async () => []);
const webhookDeliveryDeleteManyMock = mock(async () => ({ count: 0 }));
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

type WorkerTestDeps = NonNullable<Parameters<typeof processReviewJob>[1]>
  & NonNullable<Parameters<typeof recoverReviewSessions>[0]>;

function createJob(overrides: Partial<Job<ReviewJobData>> = {}) {
  return {
    id: "review:session-1:attempt:1",
    data: jobData,
    attemptsMade: 0,
    opts: { attempts: MAX_REVIEW_ATTEMPTS },
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
      webhookDelivery: {
        deleteMany: webhookDeliveryDeleteManyMock,
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
  } as unknown as WorkerTestDeps;
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
  webhookDeliveryDeleteManyMock.mockReset();
  webhookDeliveryDeleteManyMock.mockResolvedValue({ count: 0 });
  queueAddMock.mockReset();
  queueAddMock.mockResolvedValue(undefined);
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

    expect(sessionUpdateManyMock).toHaveBeenCalledTimes(1);
    expect(sessionUpdateManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "session-1", status: { in: ["QUEUED", "RETRYING"] } },
      data: expect.objectContaining({ status: "RUNNING", jobId: "review:session-1:attempt:1" }),
    }));
    expect(reviewGraphInvokeMock).not.toHaveBeenCalled();
    expect(sessionUpdateMock).not.toHaveBeenCalled();
  });

  test("returns without writing a final status after losing ownership", async () => {
    reviewGraphInvokeMock.mockResolvedValueOnce({
      error: "REVIEW_OWNERSHIP_LOST",
      changedFiles: [],
      allComments: [],
    });

    await processReviewJob(createJob(), createDeps());

    expect(sessionUpdateManyMock).toHaveBeenCalledTimes(1);
    expect(sessionUpdateManyMock).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "COMPLETED" }),
    }));
    expect(sessionUpdateManyMock).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "FAILED" }),
    }));
  });

  test("records a timeout as a retryable review failure", async () => {
    reviewGraphInvokeMock.mockImplementationOnce(
      () => new Promise<ReviewGraphTestResult>(() => undefined),
    );

    await expect(processReviewJob(
      createJob(),
      { ...createDeps(), reviewTimeoutMs: 1 },
    )).rejects.toThrow("Review processing timed out");

    expect(sessionUpdateManyMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: "RETRYING",
        lastErrorCode: "REVIEW_TIMEOUT",
      }),
    }));
  });

  test("uses a new ownership lease for every BullMQ execution", async () => {
    reviewGraphInvokeMock.mockRejectedValueOnce(new Error("first attempt failed"));

    await expect(processReviewJob(createJob(), createDeps())).rejects.toThrow("first attempt failed");
    await processReviewJob(createJob({ attemptsMade: 1 }), createDeps());

    const firstLease = (reviewGraphInvokeMock.mock.calls[0]?.[0] as { leaseId: string }).leaseId;
    const secondLease = (reviewGraphInvokeMock.mock.calls[1]?.[0] as { leaseId: string }).leaseId;
    expect(firstLease).toContain(":lease:");
    expect(secondLease).toContain(":lease:");
    expect(secondLease).not.toBe(firstLease);
  });

  test("marks a terminal failure when the retry limit is reached", async () => {
    reviewGraphInvokeMock.mockRejectedValueOnce(new Error("provider failed"));
    const terminalJobId = `review:session-1:attempt:${MAX_REVIEW_ATTEMPTS}`;

    await expect(processReviewJob(
      createJob({ attemptsMade: MAX_REVIEW_ATTEMPTS - 1, id: terminalJobId }),
      createDeps(),
    )).rejects.toThrow("provider failed");

    expect(sessionUpdateManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ jobId: terminalJobId }),
      data: expect.objectContaining({
        status: "FAILED",
        lastErrorCode: "REVIEW_PROCESSING_FAILED",
      }),
    }));
  });
});

describe("recoverReviewSessions", () => {
  test("requeues a terminal queue job using the next session attempt", async () => {
    sessionFindManyMock.mockResolvedValueOnce([{
      id: "session-2",
      reviewKey: "repo-2:7:sha-2",
      repositoryId: "repo-2",
      prNumber: 7,
      headSha: "sha-2",
      baseBranch: "main",
      attemptCount: 1,
      jobId: "review:session-2:attempt:1",
      repository: {
        id: "repo-2",
        owner: "octocat",
        name: "second-repo",
        isActive: true,
        autoReviewEnabled: true,
        installation: { githubInstallationId: 456n, status: "ACTIVE" },
      },
    }]);
    queueGetJobMock.mockResolvedValueOnce({
      getState: async () => "completed",
    } as never);

    await recoverReviewSessions(createDeps());

    expect(sessionUpdateManyMock).toHaveBeenCalledWith({
      where: { id: "session-2", jobId: "review:session-2:attempt:1" },
      data: { jobId: null, leaseId: null },
    });
    expect(queueAddMock).toHaveBeenCalledWith(
      "review",
      expect.objectContaining({ reviewSessionId: "session-2" }),
      { jobId: "review:session-2:attempt:2" },
    );
  });

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

    expect(webhookDeliveryDeleteManyMock).toHaveBeenCalledWith({
      where: {
        receivedAt: { lt: expect.any(Date) },
        status: { in: ["PROCESSED", "IGNORED"] },
      },
    });
    expect(sessionFindManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        status: { in: ["QUEUED", "RETRYING"] },
        headSha: { not: null },
        createdAt: { lt: expect.any(Date) },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    }));
    expect(queueAddMock).toHaveBeenCalledWith(
      "review",
      expect.objectContaining({ reviewSessionId: "session-2", reviewKey: "repo-2:7:sha-2" }),
      { jobId: "review:session-2:attempt:1" },
    );
  });
});
