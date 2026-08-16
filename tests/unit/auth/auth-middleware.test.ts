import { beforeAll, describe, expect, mock, test } from "bun:test";
import jwt from "jsonwebtoken";
import { setupTestEnv } from "../../support/env";
import { createMockRequest, createMockResponse } from "../../support/express";

setupTestEnv();

let authMiddleware: any;
let signToken: any;

beforeAll(async () => {
  const modulePath = "../../../apps/server/src/middleware/auth.middleware";
  const mod = await import(modulePath);
  authMiddleware = mod.authMiddleware;
  signToken = mod.signToken;
});

describe("authMiddleware", () => {
  test("rejects requests without a bearer token", async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = mock(() => undefined);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ success: false, message: null, error: "TOKEN_REQUIRED" });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects malformed and invalid tokens without calling next", async () => {
    const req = createMockRequest({ headers: { authorization: "Bearer not-a-valid-jwt" } });
    const res = createMockResponse();
    const next = mock(() => undefined);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ success: false, message: null, error: "INVALID_TOKEN" });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects non-Bearer authorization schemes", async () => {
    const token = signToken("user-1", "dev@pullrabbit.dev");
    const req = createMockRequest({ headers: { authorization: `Basic ${token}` } });
    const res = createMockResponse();
    const next = mock(() => undefined);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body.error).toBe("TOKEN_REQUIRED");
    expect(next).not.toHaveBeenCalled();
  });

  test("accepts signed tokens and attaches auth context", async () => {
    const token = signToken("user-123", "dev@pullrabbit.dev");
    const req = createMockRequest({ headers: { authorization: `Bearer ${token}` } });
    const res = createMockResponse();
    const next = mock(() => undefined);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toMatchObject({ userId: "user-123", email: "dev@pullrabbit.dev" });
    expect(req.userId).toBe("user-123");
  });

  test("signToken emits a seven-day JWT with expected claims", () => {
    const token = signToken("user-123", "dev@pullrabbit.dev");
    const decoded = jwt.verify(token, process.env.SERVER_JWT_SECRET!) as jwt.JwtPayload;

    expect(decoded.userId).toBe("user-123");
    expect(decoded.email).toBe("dev@pullrabbit.dev");
    expect(decoded.exp! - decoded.iat!).toBe(7 * 24 * 60 * 60);
  });
});
