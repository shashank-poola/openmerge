import { describe, expect, test } from "bun:test";
import { agentTrace } from "../llm.trace";

describe("agentTrace", () => {
  test("keeps the agent tag and the caller metadata", () => {
    expect(
      agentTrace("codeAgent", "agent:code", {
        tags: ["repo:openmerge/openmerge"],
        metadata: { reviewSessionId: "session-1" },
      }),
    ).toEqual({
      runName: "codeAgent",
      tags: ["agent:code", "repo:openmerge/openmerge"],
      metadata: { reviewSessionId: "session-1" },
    });
  });

  test("does not let a caller rename the agent run", () => {
    expect(agentTrace("codeAgent", "agent:code", { runName: "other" }).runName).toBe("codeAgent");
  });
});
