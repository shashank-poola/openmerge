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

const verifyMock = mock<(payload: string, signature: string) => Promise<boolean>>(async () => true);
const installationUpdateManyMock = mock(async () => ({ count: 1 }));
const repoFindUniqueMock = mock<() => Promise<RepoLookupResult>>(async () => null);
const reviewSessionFindFirstMock = mock(async () => null);
const reviewSessionCreateMock = mock(async () => ({ id: "session-1" }));
const reviewSessionUpdateMock = mock(async () => ({ id: "session-1" }));
const reviewQueueAddMock = mock(async () => undefined);

mock.module("@octokit/webhooks", () => ({
  Webhooks: class {
    verify = verifyMock;
  },
}));

let handleWebhook: typeof import("../webhook.controller").handleWebhook;
let handleInstallationEvent: typeof import("../webhook.controller").handleInstallationEvent;
let handlePullRequestEvent: typeof import("../webhook.controller").handlePullRequestEvent;

beforeAll(async () => {
  const modulePath = "../webhook.controller";
  ({ handleWebhook, handleInstallationEvent, handlePullRequestEvent } = await import(modulePath));
});

beforeEach(() => {
  verifyMock.mockReset();
  verifyMock.mockResolvedValue(true);
  installationUpdateManyMock.mockClear();
  repoFindUniqueMock.mockClear();
  reviewSessionFindFirstMock.mockClear();
  reviewSessionCreateMock.mockClear();
  reviewSessionUpdateMock.mockClear();
  reviewQueueAddMock.mockClear();
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
          findFirst: reviewSessionFindFirstMock,
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
