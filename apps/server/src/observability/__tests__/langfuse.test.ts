import { describe, expect, test } from "bun:test";

process.env.NODE_ENV = "test";
process.env.SERVER_JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgresql://openmerge:openmerge@localhost:5432/openmerge_test";
process.env.GITHUB_CLIENT_ID = "github-client-id";
process.env.GITHUB_CLIENT_SERVER = "github-client-secret";
process.env.GITHUB_CALLBACK_URL = "http://localhost:3000/auth/github/callback";
process.env.GITHUB_APP_ID = "12345";
process.env.GITHUB_APP_NAME = "openmerge-test";
process.env.GITHUB_APP_CLIENT_ID = "github-app-client-id";
process.env.GITHUB_APP_CLIENT_SECRET = "github-app-client-secret";
process.env.GITHUB_WEBHOOK_SECRET = "webhook-secret";
process.env.GITHUB_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----";
process.env.GROQ_API_KEY = "groq-test-key";
delete process.env.LANGFUSE_PUBLIC_KEY;
delete process.env.LANGFUSE_SECRET_KEY;

const { isLangfuseEnabled, langfuseCallbacks, withReviewTrace, flushLangfuse, shutdownLangfuse } =
  await import("../langfuse");

const trace = {
  reviewSessionId: "session-1",
  owner: "openmerge",
  repoName: "openmerge",
  prNumber: 7,
  headSha: "abc123",
};

describe("langfuse observability", () => {
  test("stays disabled without credentials", () => {
    expect(isLangfuseEnabled()).toBe(false);
    expect(langfuseCallbacks()).toEqual([]);
  });

  test("runs the traced work when disabled", async () => {
    await expect(withReviewTrace(trace, async () => "done")).resolves.toBe("done");
  });

  test("propagates failures from the traced work", async () => {
    await expect(
      withReviewTrace(trace, async () => {
        throw new Error("review failed");
      }),
    ).rejects.toThrow("review failed");
  });

  test("flushing without a processor is a no-op", async () => {
    await expect(flushLangfuse()).resolves.toBeUndefined();
  });

  test("shutdown is safe and keeps tracing off", async () => {
    await expect(shutdownLangfuse()).resolves.toBeUndefined();
    expect(isLangfuseEnabled()).toBe(false);
    expect(langfuseCallbacks()).toEqual([]);
    await expect(withReviewTrace(trace, async () => "done")).resolves.toBe("done");
  });
});
