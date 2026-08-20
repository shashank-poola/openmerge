import { describe, expect, test } from "bun:test";
import { parseAgentComments } from "../agent.types";

describe("parseAgentComments", () => {
  test("extracts JSON arrays from model output wrapped in prose", () => {
    const comments = parseAgentComments(`Here are the findings:\n[
      {
        "filePath": "src/auth.ts",
        "line": 12,
        "body": "Missing token validation",
        "severity": "HIGH",
        "category": "SECURITY"
      }
    ]\nThanks.`);

    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      filePath: "src/auth.ts",
      line: 12,
      severity: "HIGH",
      category: "SECURITY",
    });
  });

  test("returns an empty list when the model emits malformed JSON", () => {
    expect(parseAgentComments("[{ invalid json }")).toEqual([]);
  });

  test("returns an empty list when no JSON array is present", () => {
    expect(parseAgentComments("No actionable findings.")).toEqual([]);
  });

  test("preserves optional review metadata from valid comments", () => {
    const comments = parseAgentComments(JSON.stringify([
      {
        filePath: "src/review.ts",
        line: 42,
        startLine: 40,
        body: "Use a transaction here.",
        severity: "MEDIUM",
        category: "BUG",
        suggestion: "Wrap both writes in a transaction.",
      },
    ]));

    expect(comments[0]).toMatchObject({
      startLine: 40,
      suggestion: "Wrap both writes in a transaction.",
    });
  });
});
