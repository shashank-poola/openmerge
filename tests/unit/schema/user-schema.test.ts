import { describe, expect, test } from "bun:test";
import { userSchema } from "../../../apps/server/src/schema/user.schema";

describe("userSchema", () => {
  test("coerces GitHub user IDs to bigint", () => {
    const parsed = userSchema.parse({
      githubUserId: "9223372036854775807",
      githubLogin: "octocat",
      email: "octocat@github.com",
      name: "Octo Cat",
      avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    });

    expect(parsed.githubUserId).toBe(9223372036854775807n);
  });

  test("allows null email/name/avatar values from GitHub", () => {
    const parsed = userSchema.parse({
      githubUserId: 1,
      githubLogin: "private-user",
      email: null,
      name: null,
      avatarUrl: null,
    });

    expect(parsed.email).toBeNull();
    expect(parsed.name).toBeNull();
    expect(parsed.avatarUrl).toBeNull();
  });

  test("rejects empty logins, invalid emails, and unsafe avatar URLs", () => {
    expect(() => userSchema.parse({ githubUserId: 1, githubLogin: "", email: null })).toThrow();
    expect(() => userSchema.parse({ githubUserId: 1, githubLogin: "octocat", email: "not-email" })).toThrow();
    expect(() => userSchema.parse({
      githubUserId: 1,
      githubLogin: "octocat",
      email: null,
      avatarUrl: "javascript:alert(1)",
    })).toThrow();
  });
});
