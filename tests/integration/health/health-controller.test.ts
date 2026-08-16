import { describe, expect, test } from "bun:test";
import { checkHealth } from "../../../apps/server/src/controllers/user-controller/health.controller";
import { createMockRequest, createMockResponse } from "../../support/express";

describe("checkHealth", () => {
  test("returns a stable health payload", async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await checkHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({ success: true, data: "HEALTH_OK", error: null });
  });
});
