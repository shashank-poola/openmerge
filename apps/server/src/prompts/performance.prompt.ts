import type { AgentInput } from "../agent/agent.types";
import { SPECIALIST_REVIEW_POLICY } from "../agent/finding.policy";

export const PERFORMANCE_SYSTEM = `You are a performance engineer reviewing a pull request for demonstrated regressions introduced by this diff.

Only report an added line when the supplied code establishes adverse growth or workload behavior and a concrete consequence. Static caller counts do not prove traffic, hotness, or production scale. Do not invent request rates, row counts, concurrency, latency, or capacity. Do not report questions, possibilities, optional optimization, or pre-existing bottlenecks.

## What to look for
- N+1 queries: a DB query inside a loop — should be batched into a single query with WHERE IN
- Missing indexes on columns used in WHERE, ORDER BY, or JOIN clauses added by this diff
- Synchronous/blocking operations in async code paths that stall the event loop
- Unbounded data fetching: no LIMIT, no pagination on queries that could grow without bound
- Memory leaks: objects allocated in loops without release, event listeners registered without corresponding cleanup
- Expensive operations in hot paths: O(n²) or worse algorithms, regex compilation inside loops
- Unnecessary sequential awaits that could be parallelized with Promise.all
- Large payload serialization: sending entire objects over the wire when only a few fields are needed

${SPECIALIST_REVIEW_POLICY}

## Output format
Return one raw JSON array and nothing else. Do not include a markdown fence, prose, or explanation outside the JSON array.

The JSON array items must have exactly these fields:
- filePath: string — exact path from the diff header
- line: number — line number in the NEW file
- body: string — state the changed behavior, supported workload or growth trigger, concrete consequence, and actionable correction. Do not invent production metrics.
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- category: "PERFORMANCE"
- currentCode: string — the exact slow/problematic line(s) of code from the diff (copy verbatim from the + lines, single line preferred)
- suggestion: string — the optimized implementation as actual runnable code, not a description
- blocking: boolean — required for schema compatibility; the host determines its final value.

Return [] if no real performance issues are found.
Maximum 5 comments — only the most impactful ones. A review with 2 precise, well-quantified findings is worth more than one with 5 vague warnings.`;

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
                const fns = s.functions
                    .map((f) => `${f.isAsync ? "async " : ""}${f.name}()`)
                    .join(", ");
                return `  ${s.filePath}: functions=[${fns}]`;
            })
            .join("\n");
        parts.push(`\n=== CHANGED FUNCTIONS ===\n${astSummary}`);
    }

    if (params.context.codeGraph.length > 0) {
        // Static call counts are context only; they do not prove production workload.
        const allNodes = params.context.codeGraph;
        const hotPaths = allNodes
            .filter((n) => n.calledBy.length > 1)
            .map(
                (n) =>
                    `  ${n.functionName} (${n.filePath}) — ${n.calledBy.length} known static callers: ${n.calledBy.map((c) => c.functionName).join(", ")}`
            );
        const coldPaths = allNodes
            .filter((n) => n.calledBy.length <= 1)
            .map(
                (n) =>
                    `  ${n.functionName} (${n.filePath}) — ${n.calledBy.length === 0 ? "no known callers (may be entry point)" : `called by: ${n.calledBy[0]?.functionName ?? "unknown"}`}`
            );

        const graphLines = [...hotPaths, ...coldPaths];
        if (graphLines.length > 0) {
            parts.push(
                `\n=== STATIC CODE GRAPH (context only; caller counts do not establish traffic or hot paths) ===\n${graphLines.join("\n")}`
            );
        }
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(
        `\nIdentify only demonstrated performance regressions introduced by lines marked + in this diff. Require evidence of workload or growth behavior; do not invent traffic estimates. Return only the JSON array.`
    );

    return parts.join("\n");
};
