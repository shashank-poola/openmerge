import { describe, expect, test } from "bun:test";
import { filterReviewComments } from "../dashboard";
import type { ReviewComment } from "../../types/dashboard";

const comments: ReviewComment[] = [
  { id: "1", reviewSessionId: "r", filePath: "src/Auth.ts", line: 1, startLine: null, side: "RIGHT", startSide: null, title: "Missing check", body: "Validate the token", severity: "HIGH", category: "SECURITY", suggestion: "verifyToken()", githubCommentId: null, createdAt: "2026-01-01" },
  { id: "2", reviewSessionId: "r", filePath: "src/cache.ts", line: 2, startLine: null, side: "RIGHT", startSide: null, title: null, body: "Cache the result", severity: "LOW", category: "PERFORMANCE", suggestion: null, githubCommentId: null, createdAt: "2026-01-01" },
];

describe("finding search", () => {
  test("matches paths, titles, bodies, and suggestions without case or surrounding whitespace", () => {
    for (const term of [" auth.TS ", "MISSING", "TOKEN", "verifytoken() "]) {
      expect(filterReviewComments(comments, null, term).map((comment) => comment.id)).toEqual(["1"]);
    }
  });

  test("combines search with severity and handles empty or unmatched searches", () => {
    expect(filterReviewComments(comments, "LOW", "cache").map((comment) => comment.id)).toEqual(["2"]);
    expect(filterReviewComments(comments, "LOW", "token")).toEqual([]);
    expect(filterReviewComments(comments, null, "  ")).toEqual(comments);
    expect(filterReviewComments(comments, null, "absent")).toEqual([]);
  });
});
