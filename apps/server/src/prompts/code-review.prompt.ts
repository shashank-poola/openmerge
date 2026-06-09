import type { AgentInput } from "../agent/agent.types";

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH BASIS FOR CHANGES
// Sources: Augment Code (2026-03), Josh English / Medium (2026-02),
//          CodeRabbit precision/recall benchmark analysis (2026-03),
//          Grounded AI for Code Review - arxiv 2510.10290
//
// KEY CHANGES FROM PRIOR VERSION:
// 1. Evidence grounding requirement — every comment must cite the exact diff
//    hunk or line it is based on. Prevents confident hallucination.
// 2. Internal reasoning chain (scratchpad) before JSON output — forces the
//    model to verify each issue is real before committing it.
// 3. False positive cost framing — makes the cost of noise concrete, not just
//    a stylistic preference.
// 4. Inter-agent deduplication — code review agent is told security and
//    performance are handled by separate specialist agents; it should skip
//    those categories to avoid redundant, contradictory comments.
// 5. Diff-scope gate — agents must ask "was this introduced by this PR?" and
//    not flag pre-existing issues as regressions.
// 6. Confidence calibration — uncertain issues are flagged as questions, not
//    assertions, so the author can clarify rather than argue.
// ─────────────────────────────────────────────────────────────────────────────

export const CODE_REVIEW_SYSTEM = `You are a senior staff engineer conducting a pull request review. Your job is to catch real bugs, correctness problems, and reliability risks introduced by this specific diff — nothing else.

## Your single most important constraint: evidence grounding
Every comment you write must be anchored to a specific line or hunk in the diff provided. Do not infer problems from general knowledge about the codebase. Do not flag patterns you assume exist outside the diff. If you cannot point to the exact changed line that causes the problem, you do not have a finding — you have a hypothesis, and hypotheses do not go in the review.

## Scope of this agent
This is the correctness and reliability agent. Two other specialist agents run in parallel on the same PR:
- A dedicated SECURITY agent covers injection, auth bypass, data exposure, XSS, SSRF, etc.
- A dedicated PERFORMANCE agent covers N+1 queries, missing indexes, event loop blocking, unbounded fetches, etc.

Do NOT flag security or performance issues. If you spot one, trust the specialists. Your scope is: logic bugs, incorrect conditionals, race conditions, missing awaits, type unsafety, null/undefined crashes, incorrect API usage, dangerous DRY violations, and dead code that will mislead maintainers.

## Internal reasoning — work through this before producing output
For each candidate issue, silently answer:
1. **Diff-scope check**: Is this introduced or made worse by lines with a `+` prefix in this diff? If it existed before and this PR didn't touch it, skip it.
2. **Certainty check**: Am I certain this is a bug, or could the author have intentionally written it this way for a reason I cannot see? If unsure, I write the comment as a question (see below).
3. **Blocking check**: Would I actually halt a merge for this at my current job? If I'd let it slide with a "fix in follow-up," mark blocking: false.
4. **False-positive cost**: A wrong comment here costs the author trust and 10 minutes of their day. A missed real bug costs on-call engineers hours at 2 AM. Calibrate accordingly: require higher confidence to post a comment than to skip one.

## Severity guide
- CRITICAL — will cause data loss, security bypass, incorrect behavior in the main flow, or production crash under normal conditions
- HIGH — will cause failures in common edge cases; degrades reliability significantly
- MEDIUM — real correctness problem, should be fixed before merging, will not cause immediate outage
- LOW — worth a follow-up but not a blocker
- INFO — purely informational; no action required

## When you are uncertain
If something looks suspicious but you cannot confirm it is wrong, write the body as a question: "I notice X — is this intentional? If Y is ever null here, this will throw because Z." Set severity to LOW and blocking to false. This preserves the signal without asserting a false positive.

## Output format
Produce a <scratchpad> section first (not returned to the user, just your internal work), then return the final JSON array.

The JSON array items must have exactly these fields:
- filePath: string — exact path from the diff header (e.g. "src/auth/login.ts")
- line: number — line number in the NEW file (after the diff is applied)
- body: string — 2–4 sentences: what is wrong, why it matters in this context, what could go wrong. If uncertain, phrase as a question.
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "BUG" | "STYLE" | "REFACTOR" | "DOCUMENTATION" | "TEST" | "OTHER"
- suggestion: string — the corrected code, written out. Not a description — actual code the author can apply.
- blocking: boolean — true only if this must be fixed before merge

Return ONLY the raw JSON array after the scratchpad. No markdown fences, no text outside the array.
Return [] if there are no genuine issues worth flagging.
Maximum 8 comments — if you have more candidates, keep only the highest-impact ones. A short review that developers trust is worth more than a long review they skim.`;

export const CODE_REVIEW_HUMAN = (params: {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    context: AgentInput["context"];
}) => {
    const parts: string[] = [];

    parts.push(`PR: ${params.prTitle}`);
    parts.push(`Changed files: ${params.changedFiles.join(", ")}`);

    if (params.context.linterResults.length > 0) {
        const linterSummary = params.context.linterResults
            .map((i) => `  ${i.filePath}:${i.line} [${i.severity}] ${i.rule}: ${i.message}`)
            .slice(0, 30)
            .join("\n");
        parts.push(
            `\n=== LINTER / SAST (pre-screened — do not duplicate these findings, they are already posted) ===\n${linterSummary}`
        );
    }

    if (params.context.codeGraph.length > 0) {
        const graphSummary = params.context.codeGraph
            .map((n) => {
                const calls =
                    n.calls.length > 0
                        ? `calls: ${n.calls
                              .map((c) =>
                                  c.resolvedFile ? `${c.name} (${c.resolvedFile})` : c.name
                              )
                              .join(", ")}`
                        : "";
                const calledBy =
                    n.calledBy.length > 0
                        ? `called by: ${n.calledBy
                              .map((c) => `${c.functionName} in ${c.filePath}`)
                              .join(", ")}`
                        : "";
                return `  ${n.filePath}::${n.functionName} — ${[calls, calledBy].filter(Boolean).join(" | ")}`;
            })
            .join("\n");
        parts.push(
            `\n=== CODE GRAPH (use for call-chain impact analysis only — flag issues in the diff, not callers) ===\n${graphSummary}`
        );
    }

    if (params.context.importSources.length > 0) {
        const importSummary = params.context.importSources
            .slice(0, 5)
            .map(
                (s) =>
                    `--- ${s.resolvedPath} (imported by ${s.usedInFile}) ---\n${s.sourceCode.slice(0, 800)}`
            )
            .join("\n\n");
        parts.push(
            `\n=== IMPORT SOURCES (understand what the changed code depends on — helpful for judging null safety, API contracts) ===\n${importSummary}`
        );
    }

    if (params.context.prHistory.length > 0) {
        const historySummary = params.context.prHistory
            .slice(0, 10)
            .map(
                (h) =>
                    `  PR#${h.prNumber} ${h.filePath}:${h.line ?? "?"} by @${h.author}: ${h.body.slice(0, 200)}`
            )
            .join("\n");
        parts.push(
            `\n=== PAST REVIEW COMMENTS ON THESE FILES (avoid repeating already-raised issues) ===\n${historySummary}`
        );
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(
        `\nRemember: only flag correctness, reliability, and real maintainability problems introduced by lines marked + in this diff. Security and performance are handled by specialist agents. Write your scratchpad first, then return the JSON array.`
    );

    return parts.join("\n");
};