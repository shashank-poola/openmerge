import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { setupTestEnv } from "../../../../../../tests/support/env";
import { createMockRequest, createMockResponse } from "../../../../../../tests/support/express";

setupTestEnv();

type RepoLookupResult = {
  id: string;
  owner?: string;
  name?: string;
  isActive: boolean;
  autoReviewEnabled: boolean;
  installation: {
    status: string;
    githubInstallationId: bigint;
  };
} | null;

type ReviewSessionLookup = {
  id: string;
  status: "QUEUED" | "RUNNING" | "RETRYING" | "COMPLETED" | "FAILED";
  attemptCount: number;
  reviewKey: string | null;
  jobId: string | null;
} | null;
type DeliveryClaim = { deliveryId: string; receivedAt: Date };

const defaultDeliveryClaim: DeliveryClaim = {
  deliveryId: "delivery-1",
  receivedAt: new Date("2026-08-20T12:00:00.000Z"),
};
const verifyMock = mock<(payload: string, signature: string) => Promise<boolean>>(async () => true);
const recordDeliveryMock = mock<() => Promise<DeliveryClaim | null>>(async () => defaultDeliveryClaim);
const updateDeliveryMock = mock(async () => undefined);
const installationUpdateManyMock = mock(async () => ({ count: 1 }));
const repoFindUniqueMock = mock<() => Promise<RepoLookupResult>>(async () => null);
const reviewSessionFindUniqueMock = mock<() => Promise<ReviewSessionLookup>>(async () => null);
const reviewSessionCreateMock = mock<() => Promise<NonNullable<ReviewSessionLookup>>>(async () => ({
  id: "session-1",
  status: "QUEUED",
  attemptCount: 0,
  reviewKey: "repo-1:17:head-sha",
  jobId: null,
}));
const reviewSessionUpdateMock = mock<() => Promise<NonNullable<ReviewSessionLookup>>>(async () => ({
  id: "session-1",
  status: "QUEUED",
  attemptCount: 0,
  reviewKey: "repo-1:17:head-sha",
  jobId: null,
}));
const reviewSessionUpdateManyMock = mock(async () => ({ count: 1 }));
const loadingCommentCreateMock = mock(async () => ({ data: { id: 123 } }));
const loadingCommentUpdateMock = mock(async () => undefined);
const reviewQueueAddMock = mock(async () => undefined);

mock.module("@octokit/webhooks", () => ({
  Webhooks: class {
    verify = verifyMock;
  },
}));

let handleWebhook: typeof import("../webhook.controller").handleWebhook;
let handleWebhookRequest: typeof import("../webhook.controller").handleWebhookRequest;
let handleInstallationEvent: typeof import("../webhook.controller").handleInstallationEvent;
let handlePullRequestEvent: typeof import("../webhook.controller").handlePullRequestEvent;

beforeAll(async () => {
  const modulePath = "../webhook.controller";
  ({ handleWebhook, handleWebhookRequest, handleInstallationEvent, handlePullRequestEvent } = await import(modulePath));
});

beforeEach(() => {
  verifyMock.mockReset();
  verifyMock.mockResolvedValue(true);
  recordDeliveryMock.mockReset();
  recordDeliveryMock.mockResolvedValue(defaultDeliveryClaim);
  updateDeliveryMock.mockReset();
  updateDeliveryMock.mockResolvedValue(undefined);
  installationUpdateManyMock.mockClear();
  repoFindUniqueMock.mockClear();
  reviewSessionFindUniqueMock.mockReset();
  reviewSessionFindUniqueMock.mockResolvedValue(null);
  reviewSessionCreateMock.mockClear();
  reviewSessionUpdateMock.mockClear();
  reviewSessionUpdateManyMock.mockReset();
  reviewSessionUpdateManyMock.mockResolvedValue({ count: 1 });
  loadingCommentCreateMock.mockReset();
  loadingCommentCreateMock.mockResolvedValue({ data: { id: 123 } });
  loadingCommentUpdateMock.mockReset();
  loadingCommentUpdateMock.mockResolvedValue(undefined);
  reviewQueueAddMock.mockReset();
  reviewQueueAddMock.mockResolvedValue(undefined);
});

describe("handleWebhook", () => {
  test("rejects webhook requests with missing signature metadata", async () => {
    const req = createMockRequest({
      headers: {},
      body: {},
    });
    const res = createMockResponse();

    await handleWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ success: false, error: "INVALID_WEBHOOK" });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  test("rejects invalid webhook signatures", async () => {
    verifyMock.mockResolvedValue(false);

    const req = createMockRequest({
      headers: {
        "x-hub-signature-256": "sha256=invalid",
        "x-github-event": "installation",
        "x-github-delivery": "delivery-1",
      },
      body: { action: "deleted", installation: { id: 42 } },
      rawBody: Buffer.from("{}"),
    });
    const res = createMockResponse();

    await handleWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ success: false, error: "INVALID_SIGNATURE" });
    expect(installationUpdateManyMock).not.toHaveBeenCalled();
  });

  test("ignores duplicate webhook deliveries", async () => {
    recordDeliveryMock.mockResolvedValue(null);
    const installationHandlerMock = mock(async () => undefined);
    const deps = {
      verify: verifyMock,
      recordDelivery: recordDeliveryMock,
      updateDelivery: updateDeliveryMock,
      handleInstallationEvent: installationHandlerMock,
      handlePullRequestEvent: mock(async () => undefined),
    } as unknown as Parameters<typeof handleWebhookRequest>[2];
    const req = createMockRequest({
      headers: {
        "x-hub-signature-256": "sha256=valid",
        "x-github-event": "installation",
        "x-github-delivery": "delivery-duplicate",
      },
      body: { action: "deleted", installation: { id: 42 } },
      rawBody: Buffer.from("{}"),
    });
    const res = createMockResponse();

    await handleWebhookRequest(req, res, deps);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({ success: true, duplicate: true });
    expect(installationHandlerMock).not.toHaveBeenCalled();
    expect(updateDeliveryMock).not.toHaveBeenCalled();
  });

  test("queues a new review with a deterministic attempt job ID", async () => {
    repoFindUniqueMock.mockResolvedValue({
      id: "repo-1",
      owner: "octocat",
      name: "hello-world",
      isActive: true,
      autoReviewEnabled: true,
      installation: {
        status: "ACTIVE",
        githubInstallationId: 99n,
      },
    });

    const deps = {
      db: {
        installation: { updateMany: installationUpdateManyMock },
        repository: { findUnique: repoFindUniqueMock },
        reviewSession: {
          findUnique: reviewSessionFindUniqueMock,
          create: reviewSessionCreateMock,
          update: reviewSessionUpdateMock,
          updateMany: reviewSessionUpdateManyMock,
        },
      },
      reviewQueue: { add: reviewQueueAddMock },
      createInstallationOctokit: () => ({
        rest: {
          issues: {
            createComment: loadingCommentCreateMock,
            updateComment: loadingCommentUpdateMock,
          },
        },
      }),
    } as unknown as NonNullable<Parameters<typeof handlePullRequestEvent>[1]>;

    await handlePullRequestEvent({
      action: "opened",
      number: 17,
      pull_request: {
        head: { sha: "head-sha" },
        base: { ref: "main" },
      },
      repository: { id: 123 },
    }, deps);

    expect(reviewQueueAddMock).toHaveBeenCalledWith(
      "review",
      expect.objectContaining({ reviewSessionId: "session-1" }),
      { jobId: "review:session-1:attempt:1" },
    );
    expect(reviewSessionUpdateMock).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: { githubLoadingCommentId: 123n },
    });
  });

  test("allows only one concurrent scheduler for the same review key", async () => {
    repoFindUniqueMock.mockResolvedValue({
      id: "repo-1",
      owner: "octocat",
      name: "hello-world",
      isActive: true,
      autoReviewEnabled: true,
      installation: {
        status: "ACTIVE",
        githubInstallationId: 99n,
      },
    });
    reviewSessionFindUniqueMock.mockResolvedValue({
      id: "session-1",
      status: "QUEUED",
      attemptCount: 0,
      reviewKey: "repo-1:17:head-sha",
      jobId: null,
    });
    reviewSessionUpdateManyMock.mockReset();
    reviewSessionUpdateManyMock.mockResolvedValueOnce({ count: 1 });
    reviewSessionUpdateManyMock.mockResolvedValueOnce({ count: 0 });

    const deps = {
      db: {
        installation: { updateMany: installationUpdateManyMock },
        repository: { findUnique: repoFindUniqueMock },
        reviewSession: {
          findUnique: reviewSessionFindUniqueMock,
          create: reviewSessionCreateMock,
          update: reviewSessionUpdateMock,
          updateMany: reviewSessionUpdateManyMock,
        },
      },
      reviewQueue: { add: reviewQueueAddMock },
      createInstallationOctokit: () => ({
        rest: {
          issues: {
            createComment: loadingCommentCreateMock,
            updateComment: loadingCommentUpdateMock,
          },
        },
      }),
    } as unknown as NonNullable<Parameters<typeof handlePullRequestEvent>[1]>;

    const payload = {
      action: "synchronize",
      number: 17,
      pull_request: {
        head: { sha: "head-sha" },
        base: { ref: "main" },
      },
      repository: { id: 123 },
    };

    await Promise.all([
      handlePullRequestEvent(payload, deps),
      handlePullRequestEvent(payload, deps),
    ]);

    expect(reviewQueueAddMock).toHaveBeenCalledTimes(1);
    expect(loadingCommentCreateMock).toHaveBeenCalledTimes(1);
  });

  test("marks a session retrying when publishing the review job fails", async () => {
    repoFindUniqueMock.mockResolvedValue({
      id: "repo-1",
      owner: "octocat",
      name: "hello-world",
      isActive: true,
      autoReviewEnabled: true,
      installation: {
        status: "ACTIVE",
        githubInstallationId: 99n,
      },
    });
    reviewQueueAddMock.mockRejectedValueOnce(new Error("Redis unavailable"));

    const deps = {
      db: {
        installation: { updateMany: installationUpdateManyMock },
        repository: { findUnique: repoFindUniqueMock },
        reviewSession: {
          findUnique: reviewSessionFindUniqueMock,
          create: reviewSessionCreateMock,
          update: reviewSessionUpdateMock,
          updateMany: reviewSessionUpdateManyMock,
        },
      },
      reviewQueue: { add: reviewQueueAddMock },
      createInstallationOctokit: () => ({
        rest: {
          issues: {
            createComment: loadingCommentCreateMock,
            updateComment: loadingCommentUpdateMock,
          },
        },
      }),
    } as unknown as NonNullable<Parameters<typeof handlePullRequestEvent>[1]>;

    await expect(handlePullRequestEvent({
      action: "synchronize",
      number: 17,
      pull_request: {
        head: { sha: "head-sha" },
        base: { ref: "main" },
      },
      repository: { id: 123 },
    }, deps)).rejects.toThrow("Redis unavailable");

    expect(reviewSessionUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: "session-1",
        status: "QUEUED",
        jobId: "review:session-1:attempt:1",
      },
      data: {
        status: "RETRYING",
        jobId: null,
        leaseId: null,
        lastErrorCode: "QUEUE_PUBLISH_FAILED",
        errorMessage: "Redis unavailable",
      },
    });
  });

  test("does not enqueue the same PR and SHA more than once", async () => {
    repoFindUniqueMock.mockResolvedValue({
      id: "repo-1",
      owner: "octocat",
      name: "hello-world",
      isActive: true,
      autoReviewEnabled: true,
      installation: {
        status: "ACTIVE",
        githubInstallationId: 99n,
      },
    });
    reviewSessionFindUniqueMock.mockResolvedValue({
      id: "session-1",
      status: "QUEUED",
      attemptCount: 1,
      reviewKey: "repo-1:17:head-sha",
      jobId: "review:session-1:attempt:1",
    });

    const deps = {
      db: {
        installation: { updateMany: installationUpdateManyMock },
        repository: { findUnique: repoFindUniqueMock },
        reviewSession: {
          findUnique: reviewSessionFindUniqueMock,
          create: reviewSessionCreateMock,
          update: reviewSessionUpdateMock,
        },
      },
      reviewQueue: { add: reviewQueueAddMock },
      createInstallationOctokit: mock(() => {
        throw new Error("should not create a GitHub client for a duplicate review");
      }),
    } as unknown as NonNullable<Parameters<typeof handlePullRequestEvent>[1]>;

    await handlePullRequestEvent({
      action: "synchronize",
      number: 17,
      pull_request: {
        head: { sha: "head-sha" },
        base: { ref: "main" },
      },
      repository: { id: 123 },
    }, deps);

    expect(reviewSessionFindUniqueMock).toHaveBeenCalledWith({
      where: { reviewKey: "repo-1:17:head-sha" },
    });
    expect(reviewQueueAddMock).not.toHaveBeenCalled();
  });

  test("marks deleted installations as removed", async () => {
    await handleInstallationEvent(
      { action: "deleted", installation: { id: 42 } },
      { updateMany: installationUpdateManyMock },
    );

    expect(installationUpdateManyMock).toHaveBeenCalledWith({
      where: { githubInstallationId: 42n },
      data: { status: "REMOVED" },
    });
    expect(reviewQueueAddMock).not.toHaveBeenCalled();
  });

  test("ignores pull request events for inactive repositories", async () => {
    repoFindUniqueMock.mockResolvedValue({
      id: "repo-1",
      isActive: false,
      autoReviewEnabled: true,
      installation: {
        status: "ACTIVE",
        githubInstallationId: 99n,
      },
    });

    const deps = {
      db: {
        installation: { updateMany: installationUpdateManyMock },
        repository: { findUnique: repoFindUniqueMock },
        reviewSession: {
          findUnique: reviewSessionFindUniqueMock,
          create: reviewSessionCreateMock,
          update: reviewSessionUpdateMock,
        },
      },
      reviewQueue: { add: reviewQueueAddMock },
      createInstallationOctokit: mock(() => {
        throw new Error("should not create an Octokit client for inactive repositories");
      }),
    } as unknown as NonNullable<Parameters<typeof handlePullRequestEvent>[1]>;

    await handlePullRequestEvent({
      action: "opened",
      number: 17,
      pull_request: {
        head: { sha: "head-sha" },
        base: { ref: "main" },
      },
      repository: { id: 123 },
    }, deps);

    expect(repoFindUniqueMock).toHaveBeenCalledWith({
      where: { githubRepoId: 123n },
      include: { installation: { select: { status: true, githubInstallationId: true } } },
    });
    expect(reviewQueueAddMock).not.toHaveBeenCalled();
  });
});
