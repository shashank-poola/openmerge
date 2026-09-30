import { describe, expect, test } from "bun:test";
import { CODE_REVIEW_SYSTEM } from "../code-review.prompt";
import { PERFORMANCE_HUMAN, PERFORMANCE_SYSTEM } from "../performance.prompt";
import { SECURITY_HUMAN, SECURITY_SYSTEM } from "../security.prompt";

const input = {
  prTitle: "Example change",
  changedFiles: ["src/example.ts"],
  diff: "diff --git a/src/example.ts b/src/example.ts",
  context: {
    linterResults: [],
    codeGraph: [],
    astSummaries: [],
    importSources: [],
    prHistory: [],
  },
};

describe("specialist review prompts", () => {
  test("requires raw JSON and suppresses speculative specialist findings", () => {
    for (const prompt of [CODE_REVIEW_SYSTEM, SECURITY_SYSTEM, PERFORMANCE_SYSTEM]) {
      expect(prompt).toContain("raw JSON array");
      expect(prompt).not.toContain("scratchpad");
    }

    expect(SECURITY_SYSTEM).toContain("demonstrated trust boundary and concrete attack path");
    expect(PERFORMANCE_SYSTEM).toContain("Do not invent request rates");
  });

  test("does not treat a generic linter error as security evidence", () => {
    const genericError = SECURITY_HUMAN({
      ...input,
      context: {
        ...input.context,
        linterResults: [{
          filePath: "src/example.ts",
          line: 2,
          column: 1,
          rule: "no-undef",
          message: "Example error",
          severity: "error",
        }],
      },
    });

    expect(genericError).not.toContain("SECURITY SAST FINDINGS");
  });

  test("labels static callers as context rather than a hot-path claim", () => {
    const prompt = PERFORMANCE_HUMAN({
      ...input,
      context: {
        ...input.context,
        codeGraph: [{
          filePath: "src/example.ts",
          functionName: "handleRequest",
          calls: [],
          calledBy: [
            { functionName: "first", filePath: "src/first.ts", line: 1 },
            { functionName: "second", filePath: "src/second.ts", line: 1 },
          ],
        }],
      },
    });

    expect(prompt).toContain("STATIC CODE GRAPH");
    expect(prompt).toContain("known static callers");
    expect(prompt).not.toContain("HOTPATH");
  });
});
