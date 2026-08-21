import { describe, expect, test } from "bun:test";
import { repoSchema } from "../../../apps/server/src/schema/repo.schema";
import { reviewSessionSchema } from "../../../apps/server/src/schema/review.schema";

describe("repoSchema", () => {
  test("applies safe repository defaults", () => {
    const parsed = repoSchema.parse({
      installationId: "550e8400-e29b-41d4-a716-446655440000",
      githubRepoId: "123456789012345678",
      owner: "openmerge",
      name: "api",
      fullName: "openmerge/api",
      defaultBranch: "main",
      isPrivate: true,
    });

    expect(parsed.githubRepoId).toBe(123456789012345678n);
    expect(parsed.isActive).toBe(true);
    expect(parsed.autoReviewEnabled).toBe(true);
  });

  test("rejects invalid ownership and repository metadata", () => {
    expect(() => repoSchema.parse({
      installationId: "not-a-uuid",
      githubRepoId: 1,
      owner: "openmerge",
      name: "api",
      fullName: "openmerge/api",
      defaultBranch: "main",
      isPrivate: false,
    })).toThrow();

    expect(() => repoSchema.parse({
      installationId: "550e8400-e29b-41d4-a716-446655440000",
      githubRepoId: 1,
      owner: "",
      name: "api",
      fullName: "openmerge/api",
      defaultBranch: "main",
      isPrivate: false,
    })).toThrow();
  });
});

describe("reviewSessionSchema", () => {
  test("defaults new review sessions to queued main-branch reviews", () => {
    const parsed = reviewSessionSchema.parse({
      repositoryId: "550e8400-e29b-41d4-a716-446655440000",
      prNumber: 42,
    });

    expect(parsed.status).toBe("QUEUED");
    expect(parsed.baseBranch).toBe("main");
    expect(parsed.filesReviewed).toBe(0);
    expect(parsed.totalComments).toBe(0);
  });

  test("rejects impossible PR numbers and negative counters", () => {
    expect(() => reviewSessionSchema.parse({
      repositoryId: "550e8400-e29b-41d4-a716-446655440000",
      prNumber: 0,
    })).toThrow();

    expect(() => reviewSessionSchema.parse({
      repositoryId: "550e8400-e29b-41d4-a716-446655440000",
      prNumber: 1,
      filesReviewed: -1,
    })).toThrow();
  });
});
