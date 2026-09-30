import { describe, expect, test } from "bun:test";
import { parseAgentComments } from "../agent.types";

const comment = (overrides: Record<string, unknown> = {}) => ({
  filePath: "src/auth.ts",
  line: 12,
  body: "The changed branch dereferences a missing session and throws for signed-out requests.",
  severity: "HIGH",
  category: "BUG",
  currentCode: "return session.user.id;",
  suggestion: "return session?.user.id;",
  blocking: false,
  ...overrides,
});

describe("parseAgentComments", () => {
  test("returns valid comments and centrally derives blocking", () => {
    const result = parseAgentComments(JSON.stringify([comment()]), "code");

    expect(result).toMatchObject({ status: "valid", invalidCount: 0 });
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]).toMatchObject({
      filePath: "src/auth.ts",
      severity: "HIGH",
      category: "BUG",
      blocking: true,
    });
  });

  test("keeps a valid empty result distinct from invalid output", () => {
    expect(parseAgentComments("[]", "code")).toEqual({
      status: "valid",
      comments: [],
      invalidCount: 0,
    });
    expect(parseAgentComments("No actionable findings.", "code")).toMatchObject({
      status: "invalid",
      comments: [],
      invalidCount: 1,
    });
  });

  test("accepts a JSON code fence but rejects prose-wrapped and malformed JSON", () => {
    expect(parseAgentComments(`\`\`\`json\n${JSON.stringify([comment()])}\n\`\`\``, "code")).toMatchObject({
      status: "valid",
      comments: [expect.objectContaining({ filePath: "src/auth.ts" })],
    });
    expect(parseAgentComments(`Findings: ${JSON.stringify([comment()])}`, "code")).toMatchObject({
      status: "invalid",
      comments: [],
    });
    expect(parseAgentComments("[{ invalid json }", "code")).toMatchObject({
      status: "invalid",
      comments: [],
    });
  });

  test("returns partial status while retaining independently valid candidates", () => {
    const result = parseAgentComments(
      JSON.stringify([
        comment(),
        comment({ filePath: "../secrets.ts" }),
      ]),
      "code",
    );

    expect(result).toMatchObject({ status: "partial", invalidCount: 1 });
    expect(result.comments).toHaveLength(1);
  });

  test("rejects category mismatches for the calling specialist", () => {
    const result = parseAgentComments(
      JSON.stringify([comment({ category: "SECURITY" })]),
      "code",
    );

    expect(result).toMatchObject({ status: "partial", comments: [], invalidCount: 1 });
  });

  test("rejects informational candidates that cannot enter publication", () => {
    const result = parseAgentComments(
      JSON.stringify([comment({ severity: "INFO" })]),
      "code",
    );

    expect(result).toMatchObject({ status: "partial", comments: [], invalidCount: 1 });
  });

  test("enforces required fields, valid ranges, and bounded text", () => {
    const result = parseAgentComments(
      JSON.stringify([
        comment({ startLine: 13 }),
        comment({ line: 0 }),
        comment({ currentCode: " " }),
        comment({ body: "x".repeat(4_001) }),
        comment({ blocking: "true" }),
        (() => {
          const missingSuggestion = comment();
          Reflect.deleteProperty(missingSuggestion, "suggestion");
          return missingSuggestion;
        })(),
        comment({ unexpected: true }),
      ]),
      "code",
    );

    expect(result).toMatchObject({ status: "partial", comments: [], invalidCount: 7 });
  });

  test("drops candidates over the specialist budget", () => {
    const result = parseAgentComments(
      JSON.stringify(Array.from({ length: 9 }, (_, index) => comment({ line: index + 1 }))),
      "code",
    );

    expect(result).toMatchObject({ status: "partial", invalidCount: 1 });
    expect(result.comments).toHaveLength(8);
  });

  test("applies the security and performance specialist category ownership", () => {
    expect(
      parseAgentComments(JSON.stringify([comment({ category: "SECURITY" })]), "security"),
    ).toMatchObject({ status: "valid" });
    expect(
      parseAgentComments(JSON.stringify([comment({ category: "PERFORMANCE" })]), "performance"),
    ).toMatchObject({ status: "valid" });
  });
});
