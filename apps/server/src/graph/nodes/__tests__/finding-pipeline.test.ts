import { describe, expect, test } from "bun:test";
import type { PRReviewStateType } from "../../review.state";
import { prepareCandidates } from "../prepare-candidates.node";
import { aggregateComments } from "../aggregator.node";
import { applyVerifierVerdicts } from "../../../agent/finding-verifier.apply";

const diff = `diff --git a/src/review.ts b/src/review.ts
index 1111111..2222222 100644
--- a/src/review.ts
+++ b/src/review.ts
@@ -1,2 +1,2 @@
-await oldCall();
+newCall();
 keep();`;

describe("verified finding pipeline", () => {
  test("grounds exact changed code and suppresses fabricated locations", () => {
    const state = {
      diff,
      error: null,
      reviewCoverage: "complete",
      codeComments: [{
        filePath: "src/review.ts",
        line: 1,
        body: "The changed call loses required sequencing.",
        severity: "HIGH",
        category: "BUG",
        currentCode: "newCall();",
        suggestion: "await newCall();",
        blocking: true,
      }, {
        filePath: "src/review.ts",
        line: 99,
        body: "Invented finding.",
        severity: "HIGH",
        category: "BUG",
        currentCode: "missing();",
        suggestion: "fix();",
        blocking: true,
      }],
      securityComments: [],
      performanceComments: [],
    } as unknown as PRReviewStateType;

    const result = prepareCandidates(state);
    expect(result.candidateFindings).toHaveLength(1);
    expect(result.candidateFindings?.[0]?.comment.currentCode).toBe("newCall();");
    expect(result.reviewCoverage).toBe("limited");
  });

  test("aggregates verified findings only and derives blocking from severity", () => {
    const state = {
      verifiedComments: [{
        filePath: "src/review.ts",
        line: 1,
        body: "Confirmed bounded defect.",
        severity: "MEDIUM",
        category: "BUG",
        currentCode: "newCall();",
        blocking: true,
      }, {
        filePath: "src/auth.ts",
        line: 5,
        body: "Confirmed access control bypass.",
        severity: "HIGH",
        category: "SECURITY",
        currentCode: "return record;",
        blocking: false,
      }],
      codeComments: [{
        filePath: "src/raw.ts",
        line: 2,
        body: "Unverified raw claim.",
        severity: "CRITICAL",
        category: "BUG",
      }],
    } as unknown as PRReviewStateType;

    const result = aggregateComments(state);
    expect(result.allComments).toHaveLength(2);
    expect(result.allComments?.[0]).toMatchObject({ severity: "HIGH", blocking: true });
    expect(result.allComments?.[1]).toMatchObject({ severity: "MEDIUM", blocking: false });
    expect(result.allComments?.some((comment) => comment.filePath === "src/raw.ts")).toBe(false);
  });

  test("the verifier can suppress or demote findings but cannot promote them", () => {
    const candidates = [{
      id: "code-1",
      sourceAgent: "code" as const,
      comment: {
        filePath: "src/review.ts",
        line: 1,
        body: "Producer claim.",
        severity: "MEDIUM" as const,
        category: "BUG" as const,
        currentCode: "newCall();",
        suggestion: "await newCall();",
      },
    }, {
      id: "security-1",
      sourceAgent: "security" as const,
      comment: {
        filePath: "src/auth.ts",
        line: 2,
        body: "Speculative claim.",
        severity: "HIGH" as const,
        category: "SECURITY" as const,
        currentCode: "return value;",
      },
    }];

    const result = applyVerifierVerdicts(candidates, [{
      candidateId: "code-1",
      verdict: "keep",
      severity: "CRITICAL",
      body: "Confirmed bounded defect.",
      evidence: [{ snippetId: "code-1:diff", quote: "newCall();" }],
      preserveSuggestion: false,
    }, {
      candidateId: "security-1",
      verdict: "uncertain",
      reasonCode: "missing_context",
    }]);

    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]).toMatchObject({ severity: "MEDIUM", blocking: false, suggestion: undefined });
    expect(result.stats).toMatchObject({ kept: 1, uncertain: 1, demoted: 0 });
  });
});
