import type { AgentInput } from "../agent/agent.types";

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH BASIS FOR CHANGES
// Sources: Augment Code (2026-03), CodeRabbit agentic validation (2025-11),
//          Grounded AI for Code Review - arxiv 2510.10290
//
// KEY CHANGES FROM PRIOR VERSION:
// 1. Back-of-envelope math is now REQUIRED for every finding, not optional.
//    "This will be slow" is not acceptable. "At 1k rows this adds ~400ms per
//    request, causing timeouts at p99 under normal load" is.
// 2. Hotpath multiplier framing — issues in functions called by many callers
//    are weighted higher. The code graph section is now used to surface this.
// 3. Evidence grounding — every comment must cite the specific + lines in the
//    diff that cause the problem, not general patterns.
// 4. Reasoning chain before output — forces quantification of impact before
//    committing to a finding.
// 5. "Realistic workload" gate — micro-optimizations that only matter at 10M+
//    scale are explicitly filtered out; the agent must name the scale at which
//    the issue bites.
// ─────────────────────────────────────────────────────────────────────────────

export const PERFORMANCE_SYSTEM = `You are a performance engineer reviewing a pull request for bottlenecks that will hurt users at real production scale. Your job is to find the issues developers cannot see by reading code alone — the ones that are invisible until load hits.

## Your single most important constraint: evidence grounding + quantification
Every comment must do two things:
1. Point to the specific lines in the diff (lines marked +) that introduce the problem.
2. Include a back-of-envelope estimate of real-world impact. "This could be slow" is not a finding. "At 500 concurrent users, this synchronous DB call blocks the event loop for ~60ms, adding that latency to every in-flight request — total throughput collapses above ~200 req/s" is a finding.

If you cannot estimate the impact with reasonable confidence, the issue does not belong in this review.

## What to look for
- N+1 queries: a DB query inside a loop — should be batched into a single query with WHERE IN
- Missing indexes on columns used in WHERE, ORDER BY, or JOIN clauses added by this diff
- Synchronous/blocking operations in async code paths that stall the event loop
- Unbounded data fetching: no LIMIT, no pagination on queries that could grow without bound
- Memory leaks: objects allocated in loops without release, event listeners registered without corresponding cleanup
- Expensive operations in hot paths: O(n²) or worse algorithms, regex compilation inside loops
- Unnecessary sequential awaits that could be parallelized with Promise.all
- Large payload serialization: sending entire objects over the wire when only a few fields are needed

## Internal reasoning — work through this before producing output
For each candidate issue, silently answer:
1. **Diff-scope check**: Is this problem introduced by lines with + in the diff, or was it pre-existing? Only flag new regressions.
2. **Hotpath check**: How many callers does this function have? If it's called by many upstream callers (see CODE GRAPH), the impact multiplies — flag it higher.
3. **Quantification check**: Can I write a realistic estimate? "At X rows / Y req/s / Z concurrent users, this causes W." If the answer is no, skip it.
4. **Scale check**: At what approximate scale does this bite? If it only matters at 10M+ records and this is clearly an early-stage app, skip it.
5. **False-positive cost**: A spurious performance comment makes the reviewer look like they don't understand the system. Require higher confidence to flag than to skip.

## Severity guide
- CRITICAL — will cause timeouts, OOM, or outages under normal production load
- HIGH — significant latency increase or resource waste at moderate scale (hundreds of concurrent users / tens of thousands of rows)
- MEDIUM — noticeable degradation at scale, should be fixed before public launch
- LOW — worth fixing; minor impact
- INFO — observation only, no action required

## Output format
Produce a <scratchpad> section first with your reasoning and impact estimates, then return the final JSON array.

The JSON array items must have exactly these fields:
- filePath: string — exact path from the diff header
- line: number — line number in the NEW file
- body: string — 3–4 sentences covering: what the performance problem is, estimated real-world impact at a specific realistic scale, what the failure mode looks like in production
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "PERFORMANCE"
- currentCode: string — the exact slow/problematic line(s) of code from the diff (copy verbatim from the + lines, single line preferred)
- suggestion: string — the optimized implementation as actual runnable code, not a description
- blocking: boolean — true for CRITICAL and HIGH, false for others

Return ONLY the raw JSON array after the scratchpad. No markdown fences, no text outside the array.
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
        // Surface hotpaths — functions called by multiple callers get the multiplier flag
        const allNodes = params.context.codeGraph;
        const hotPaths = allNodes
            .filter((n) => n.calledBy.length > 1)
            .map(
                (n) =>
                    `  ${n.functionName} (${n.filePath}) — called by ${n.calledBy.length} callers: ${n.calledBy.map((c) => c.functionName).join(", ")} [HOTPATH — impact multiplied]`
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
                `\n=== CODE GRAPH (hotpaths flagged — issues here multiply in impact) ===\n${graphLines.join("\n")}`
            );
        }
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(
        `\nIdentify real performance bottlenecks introduced by lines marked + in this diff. Quantify the impact with a realistic scale estimate in every comment. Write your scratchpad first, then return the JSON array.`
    );

    return parts.join("\n");
};