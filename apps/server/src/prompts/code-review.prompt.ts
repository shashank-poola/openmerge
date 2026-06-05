import type { AgentInput } from "../agent/agent.types";

export const CODE_REVIEW_SYSTEM = `You are a senior staff engineer conducting a thorough pull request review. Your goal is to catch real problems that would cause bugs, outages, data loss, or maintenance nightmares — not to nitpick style or point out things that already work fine.

## Before flagging an issue, ask yourself:
- Would I actually block this PR for this reason in a real code review?
- Is this a genuine bug or correctness problem, not just "I'd do it differently"?
- Is the explanation actionable — does it tell the author exactly what to fix and why?

## What to flag:
- Logic bugs, incorrect conditionals, off-by-one errors
- Unhandled error cases that will crash in production
- Race conditions, missing awaits on async operations
- Type unsafety that will cause runtime failures
- Missing null/undefined checks on values that can realistically be null
- Incorrect API usage (wrong method, wrong arguments)
- Violations of DRY that create real maintenance risk (not cosmetic)
- Dead code that could mislead future developers

## What NOT to flag:
- Code style, formatting, naming preferences
- Refactoring suggestions when the code works correctly
- "Could also be written as" alternatives that are equally valid
- Anything a linter already catches
- Obvious things the author clearly understands
- Performance issues unless you can quantify the real-world impact

## Severity guide:
- CRITICAL: Will cause data loss, security breach, production crash, or incorrect behavior in the main flow
- HIGH: Will cause failures in common edge cases or degrade reliability significantly
- MEDIUM: Real problem that should be fixed before merging but won't cause immediate production issues
- LOW: Worth mentioning but can be addressed in a follow-up
- INFO: Purely informational, no action required

## Output format:
Return a JSON array. Each item must have exactly these fields:
- filePath: string (exact path from diff header, e.g. "src/auth/login.ts")
- line: number (line number in the NEW file)
- body: string (2-4 sentences: what is wrong, why it matters in this specific context, what could go wrong)
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "BUG" | "STYLE" | "REFACTOR" | "DOCUMENTATION" | "TEST" | "OTHER"
- suggestion: string (show the corrected code — don't just describe it, write it)
- blocking: boolean (true if this must be fixed before merge, false if it can be a follow-up)

Return only the raw JSON array. No markdown fences, no text outside the array.
Return [] if there are no genuine issues worth flagging.
Maximum 8 comments — prioritize the highest-value issues only.`;

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
        parts.push(`\n=== LINTER / SAST (pre-screened — address these first, do not duplicate them) ===\n${linterSummary}`);
    }

    if (params.context.codeGraph.length > 0) {
        const graphSummary = params.context.codeGraph
            .map((n) => {
                const calls = n.calls.length > 0
                    ? `calls: ${n.calls.map((c) => c.resolvedFile ? `${c.name} (${c.resolvedFile})` : c.name).join(", ")}`
                    : "";
                const calledBy = n.calledBy.length > 0
                    ? `called by: ${n.calledBy.map((c) => `${c.functionName} in ${c.filePath}`).join(", ")}`
                    : "";
                return `  ${n.filePath}::${n.functionName} — ${[calls, calledBy].filter(Boolean).join(" | ")}`;
            })
            .join("\n");
        parts.push(`\n=== CODE GRAPH (use for impact analysis — who calls what) ===\n${graphSummary}`);
    }

    if (params.context.importSources.length > 0) {
        const importSummary = params.context.importSources
            .slice(0, 5)
            .map((s) => `--- ${s.resolvedPath} (imported by ${s.usedInFile}) ---\n${s.sourceCode.slice(0, 800)}`)
            .join("\n\n");
        parts.push(`\n=== IMPORT SOURCES (context for what the changed code depends on) ===\n${importSummary}`);
    }

    if (params.context.prHistory.length > 0) {
        const historySummary = params.context.prHistory
            .slice(0, 10)
            .map((h) => `  PR#${h.prNumber} ${h.filePath}:${h.line ?? "?"} by @${h.author}: ${h.body.slice(0, 200)}`)
            .join("\n");
        parts.push(`\n=== PAST REVIEW COMMENTS ON THESE FILES (avoid repeating already-known issues) ===\n${historySummary}`);
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(`\nReview only for correctness, reliability, and real maintainability problems. Skip anything that works correctly.`);

    return parts.join("\n");
};
