import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import jwt from "jsonwebtoken";
import { setupTestEnv } from "../../support/env";
import { createMockRequest, createMockResponse } from "../../support/express";

setupTestEnv();

const upsertMock = mock(async () => ({
  id: "user-1",
  githubUserId: 123n,
  githubLogin: "octocat",
  email: "octocat@github.com",
  name: "Octo Cat",
  avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
  accessToken: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
}));

mock.module("@repo/database", () => ({
  db: {
    user: {
      upsert: upsertMock,
      findUnique: mock(async () => null),
    },
  },
}));

let githubExchange: any;

beforeAll(async () => {
  const modulePath = "../../../apps/server/src/controllers/user-controller/auth.controller";
  ({ githubExchange } = await import(modulePath));
});

beforeEach(() => {
  upsertMock.mockClear();
  globalThis.fetch = mock() as unknown as typeof fetch;
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

describe("githubExchange", () => {
  test("rejects missing OAuth code before making network calls", async () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();

    await githubExchange(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ success: false, error: "MISSING_CODE" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("returns a gateway error when GitHub token exchange fails", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce(jsonResponse({ error: "bad_verification_code" }, { status: 502 }));

    const req = createMockRequest({ body: { code: "bad-code" } });
    const res = createMockResponse();

    await githubExchange(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.body).toEqual({ success: false, error: "TOKEN_EXCHANGE_FAILED" });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("rejects token responses without an access token", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce(jsonResponse({ error: "incorrect_client_credentials" }));

    const req = createMockRequest({ body: { code: "code" } });
    const res = createMockResponse();

    await githubExchange(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ success: false, error: "incorrect_client_credentials" });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("does not create a user when profile fetch fails", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce(jsonResponse({ access_token: "gho_token" }))
      .mockResolvedValueOnce(jsonResponse({ message: "bad credentials" }, { status: 401 }));

    const req = createMockRequest({ body: { code: "code" } });
    const res = createMockResponse();

    await githubExchange(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.body).toEqual({ success: false, error: "FAILED_FETCHING_PROFILE" });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("upserts a validated GitHub profile and returns a signed session token", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce(jsonResponse({ access_token: "gho_token" }))
      .mockResolvedValueOnce(jsonResponse({
        id: 123,
        login: "octocat",
        email: "octocat@github.com",
        name: "Octo Cat",
        avatar_url: "https://avatars.githubusercontent.com/u/123?v=4",
      }));

    const req = createMockRequest({ body: { code: "valid-code" } });
    const res = createMockResponse();

    await githubExchange(req, res);

    expect(upsertMock).toHaveBeenCalledWith({
      where: { githubLogin: "octocat" },
      update: {
        githubUserId: 123n,
        email: "octocat@github.com",
        name: "Octo Cat",
        avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
      },
      create: {
        githubUserId: 123n,
        githubLogin: "octocat",
        email: "octocat@github.com",
        name: "Octo Cat",
        avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.githubUserId).toBe("123");

    const decoded = jwt.verify(res.body.token, process.env.SERVER_JWT_SECRET!) as jwt.JwtPayload;
    expect(decoded.userId).toBe("user-1");
    expect(decoded.githubLogin).toBe("octocat");
  });
});
