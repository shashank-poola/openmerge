import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";

process.env.NODE_ENV = "test";
process.env.SERVER_JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "postgresql://pullrabbit:pullrabbit@localhost:5432/pullrabbit_test";
process.env.GITHUB_CLIENT_ID = "github-client-id";
process.env.GITHUB_CLIENT_SERVER = "github-client-secret";
process.env.GITHUB_CALLBACK_URL = "http://localhost:3000/auth/github/callback";
process.env.GITHUB_APP_ID = "12345";
process.env.GITHUB_APP_NAME = "pullrabbit-test";
process.env.GITHUB_APP_CLIENT_ID = "github-app-client-id";
process.env.GITHUB_APP_CLIENT_SECRET = "github-app-client-secret";
process.env.GITHUB_WEBHOOK_SECRET = "webhook-secret";
process.env.GITHUB_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----";
process.env.GROQ_API_KEY = "groq-test-key";

const invokeLLMMock = mock(async () => ({
  content: JSON.stringify([
    {
      filePath: "src/index.ts",
      line: 10,
      body: "Guard this edge case.",
      severity: "HIGH",
      category: "BUG",
    },
  ]),
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

beforeAll(async () => {
  ({ runCodeAgent } = await import("../code.agent"));
  ({ runSecurityAgent } = await import("../security.agent"));
  ({ runPerformanceAgent } = await import("../performance.agent"));
});

beforeEach(() => {
  invokeLLMMock.mockClear();
  invokeLLMMock.mockResolvedValue({
    content: JSON.stringify([
      {
        filePath: "src/index.ts",
        line: 10,
        body: "Guard this edge case.",
        severity: "HIGH",
        category: "BUG",
      },
    ]),
    provider: "groq" as const,
  });
});

describe("review agents", () => {
  test("code agent sends the code-review task and parses comments", async () => {
    const result = await runCodeAgent(input);

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    expect(invokeLLMMock).toHaveBeenCalledWith(expect.arrayContaining([]), "codeReview");
    expect(result).toMatchObject({ agentName: "codeAgent", provider: "groq" });
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]).toMatchObject({ filePath: "src/index.ts", severity: "HIGH" });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  test("security agent sends the security task and parses comments", async () => {
    const result = await runSecurityAgent(input);

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    expect(invokeLLMMock).toHaveBeenCalledWith(expect.arrayContaining([]), "security");
    expect(result).toMatchObject({ agentName: "securityAgent", provider: "groq" });
    expect(result.comments).toHaveLength(1);
  });

  test("performance agent sends the performance task and parses comments", async () => {
    const result = await runPerformanceAgent(input);

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    expect(invokeLLMMock).toHaveBeenCalledWith(expect.arrayContaining([]), "performance");
    expect(result).toMatchObject({ agentName: "performanceAgent", provider: "groq" });
    expect(result.comments).toHaveLength(1);
  });

  test("agents fail closed when all model providers fail", async () => {
    invokeLLMMock.mockRejectedValueOnce(new Error("provider unavailable"));

    const result = await runCodeAgent(input);

    expect(result.agentName).toBe("codeAgent");
    expect(result.comments).toEqual([]);
    expect(result.provider).toBe("groq");
    expect(result.error).toContain("provider unavailable");
  });
});
