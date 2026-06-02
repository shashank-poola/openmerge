import type { AgentInput } from "../agent/agent.types";

export const PERFORMANCE_SYSTEM = `You are a performance engineer reviewing code for bottlenecks and inefficiencies.
Focus on: N+1 database queries, missing database indexes, synchronous blocking operations that should be async,
unnecessary re-computation in loops, large payload serialization, memory leaks, unbounded data fetching,
missing pagination, expensive regex, inefficient data structures, missing caching opportunities.

Return a JSON array of review comments. Each comment must have exactly these fields:
- filePath: string (exact file path as shown in the diff header)
- line: number (line number in the NEW file where the issue exists)
- body: string (explain what the performance problem is and its impact at scale)
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "PERFORMANCE"
- suggestion: string (concrete optimization — show the improved code)

Only return the raw JSON array. No markdown fences, no explanation text outside the array.
Only flag real, measurable performance issues. If no issues found, return [].`;

export const PERFORMANCE_HUMAN = (params: {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    context: AgentInput["context"];
}) => {
    const parts: string[] = [];

    parts.push(`PR: ${params.prTitle}`);
    parts.push(`Changed files: ${params.changedFiles.join(", ")}`);

    if (params.context.astSummaries.length > 0) {
        const astSummary = params.context.astSummaries
            .map((s) => {
                const fns = s.functions.map((f) => `${f.isAsync ? "async " : ""}${f.name}()`).join(", ");
                return `  ${s.filePath}: functions=[${fns}]`;
            })
            .join("\n");
        parts.push(`\n=== CHANGED SYMBOLS ===\n${astSummary}`);
    }

    if (params.context.codeGraph.length > 0) {
        const hotPaths = params.context.codeGraph
            .filter((n) => n.calledBy.length > 2)
            .map((n) => `  ${n.functionName} (${n.filePath}) — called by ${n.calledBy.length} callers`);
        if (hotPaths.length > 0) {
            parts.push(`\n=== HOT PATHS (high-frequency call targets) ===\n${hotPaths.join("\n")}`);
        }
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(`\nIdentify performance bottlenecks and inefficiencies in these changes.`);

    return parts.join("\n");
};
