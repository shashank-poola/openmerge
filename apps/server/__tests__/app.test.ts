import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import type { Server } from "http";
import type { AddressInfo } from "net";
import { setupTestEnv } from "../../../tests/support/env";

setupTestEnv();

mock.module("bullmq", () => ({
  Queue: class {
    on() {
      return this;
    }
  },
}));

let app: typeof import("../src/index").app;
let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const modulePath = "../src/index";
  ({ app } = await import(modulePath));

  server = await new Promise<Server>((resolve) => {
    const startedServer = app.listen(0, () => resolve(startedServer));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind test server");
  }

  baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

describe("server app", () => {
  test("serves the public health route", async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/check-health`);
    const body = await res.json() as { success: boolean; data: string; error: null };

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, data: "HEALTH_OK", error: null });
  });

  test("protects private installation routes without a bearer token", async () => {
    const res = await fetch(`${baseUrl}/api/v1/installations`);
    const body = await res.json() as { success: false; message: null; error: string };

    expect(res.status).toBe(401);
    expect(body).toEqual({ success: false, message: null, error: "TOKEN_REQUIRED" });
  });
});
