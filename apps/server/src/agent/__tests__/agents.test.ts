import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";

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

const comment = (category: "BUG" | "SECURITY" | "PERFORMANCE") => ({
  filePath: "src/index.ts",
  line: 10,
  body: "The changed code has a confirmed defect under the supported request path.",
  severity: "HIGH" as const,
  category,
  currentCode: "return request.user.id;",
  suggestion: "return request.user?.id;",
  blocking: false,
});

const invokeLLMMock = mock(async () => ({
  content: JSON.stringify([comment("BUG")]),
  provider: "groq" as const,
}));

mock.module("../llm/llm.provider", () => ({ invokeLLM: invokeLLMMock }));
mock.module("../../llm/llm.provider", () => ({ invokeLLM: invokeLLMMock }));

const input = {
  prTitle: "Fix webhook processing",
  changedFiles: ["src/index.ts"],
  diff: "diff --git a/src/index.ts b/src/index.ts",
  context: {
    linterResults: [],
    codeGraph: [],
    astSummaries: [],
    importSources: [],
    prHistory: [],
  },
};

let runCodeAgent: typeof import("../code.agent").runCodeAgent;
let runSecurityAgent: typeof import("../security.agent").runSecurityAgent;
let runPerformanceAgent: typeof import("../performance.agent").runPerformanceAgent;
let runFindingVerifier: typeof import("../finding-verifier.agent").runFindingVerifier;

beforeAll(async () => {
  ({ runCodeAgent } = await import("../code.agent"));
  ({ runSecurityAgent } = await import("../security.agent"));
  ({ runPerformanceAgent } = await import("../performance.agent"));
  ({ runFindingVerifier } = await import("../finding-verifier.agent"));
});

beforeEach(() => {
  invokeLLMMock.mockClear();
  invokeLLMMock.mockResolvedValue({
    content: JSON.stringify([comment("BUG")]),
    provider: "groq" as const,
  });
});

describe("review agents", () => {
  test("code agent sends the code-review task and validates BUG candidates", async () => {
    const result = await runCodeAgent(input);

    expect(invokeLLMMock).toHaveBeenCalledWith(
      expect.arrayContaining([]),
      "codeReview",
      expect.objectContaining({ runName: "codeAgent" }),
    );
    expect(result).toMatchObject({
      agentName: "codeAgent",
      provider: "groq",
      outputStatus: "valid",
    });
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]).toMatchObject({ filePath: "src/index.ts", blocking: true });
  });

  test("security agent only accepts SECURITY candidates", async () => {
    invokeLLMMock.mockResolvedValueOnce({
      content: JSON.stringify([comment("SECURITY")]),
      provider: "groq" as const,
    });

    const result = await runSecurityAgent(input);

    expect(invokeLLMMock).toHaveBeenCalledWith(
      expect.arrayContaining([]),
      "security",
      expect.objectContaining({ runName: "securityAgent" }),
    );
    expect(result).toMatchObject({ agentName: "securityAgent", outputStatus: "valid" });
    expect(result.comments).toHaveLength(1);
  });

  test("performance agent only accepts PERFORMANCE candidates", async () => {
    invokeLLMMock.mockResolvedValueOnce({
      content: JSON.stringify([comment("PERFORMANCE")]),
      provider: "groq" as const,
    });

    const result = await runPerformanceAgent(input);

    expect(invokeLLMMock).toHaveBeenCalledWith(
      expect.arrayContaining([]),
      "performance",
      expect.objectContaining({ runName: "performanceAgent" }),
    );
    expect(result).toMatchObject({ agentName: "performanceAgent", outputStatus: "valid" });
    expect(result.comments).toHaveLength(1);
  });

  test("reports invalid model output separately from a valid empty review", async () => {
    invokeLLMMock.mockResolvedValueOnce({ content: "not JSON", provider: "groq" as const });
    const invalid = await runCodeAgent(input);

    invokeLLMMock.mockResolvedValueOnce({ content: "[]", provider: "groq" as const });
    const empty = await runCodeAgent(input);

    expect(invalid).toMatchObject({ outputStatus: "invalid", comments: [] });
    expect(empty).toMatchObject({ outputStatus: "valid", comments: [] });
  });

  test("agents fail closed when all model providers fail", async () => {
    invokeLLMMock.mockRejectedValueOnce(new Error("provider unavailable"));

    const result = await runCodeAgent(input);

    expect(result.agentName).toBe("codeAgent");
    expect(result.comments).toEqual([]);
    expect(result.outputStatus).toBe("invalid");
    expect(result.provider).toBe("groq");
    expect(result.error).toContain("provider unavailable");
  });

  test("finding verifier uses the verification task and validates evidence", async () => {
    invokeLLMMock.mockResolvedValueOnce({
      content: JSON.stringify({ verdicts: [{
        candidateId: "code-1",
        verdict: "keep",
        severity: "MEDIUM",
        body: "The changed call can return before work completes.",
        evidence: [{ snippetId: "code-1:diff", quote: "runTask();" }],
        preserveSuggestion: false,
      }] }),
      provider: "groq" as const,
    });

    const result = await runFindingVerifier([{
      id: "code-1",
      sourceAgent: "code",
      comment: { ...comment("BUG"), currentCode: "runTask();" },
    }], [{
      id: "code-1:diff",
      filePath: "src/index.ts",
      startLine: 10,
      endLine: 10,
      source: "diff",
      text: "runTask();",
    }]);

    expect(invokeLLMMock).toHaveBeenCalledWith(
      expect.arrayContaining([]),
      "verification",
      expect.objectContaining({ runName: "findingVerifier", signal: expect.any(AbortSignal) }),
    );
    expect(result.error).toBeUndefined();
    expect(result.verdicts[0]).toMatchObject({ verdict: "keep", severity: "MEDIUM" });
  });
});
