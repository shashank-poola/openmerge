import { describe, expect, test } from "bun:test";
import { githubUser } from "../../../apps/server/src/types/user.type";

describe("githubUser", () => {
  test("serializes bigint GitHub IDs for JSON responses", () => {
    const user = githubUser({
      id: "user-1",
      githubUserId: 123456789012345678n,
      githubLogin: "octocat",
      email: null,
      name: null,
      avatarUrl: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    expect(user.githubUserId).toBe("123456789012345678");
    expect(() => JSON.stringify(user)).not.toThrow();
  });
});
