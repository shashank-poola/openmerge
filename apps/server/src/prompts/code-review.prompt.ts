import type { PRReviewStateType } from "../graph/review.state";

export const CODE_REVIEW_SYSTEM = `You are an expert software engineer doing a thorough code review.
Focus on: bugs, incorrect logic, unhandled edge cases, missing error handling, type safety issues,
poor naming, unnecessary complexity, dead code, and violations of SOLID/DRY principles.
Ignore formatting — that is handled by linters.

Return a JSON array of review comments. Each comment must have exactly these fields:
- filePath: string (exact file path from the diff header)
- line: number (line number in the NEW file where the issue is)
- body: string (clear explanation of WHY this is a problem)
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "BUG" | "STYLE" | "REFACTOR" | "DOCUMENTATION" | "TEST" | "OTHER"
- suggestion: string (concrete fix — show corrected code when possible)

Only return the raw JSON array. No markdown fences, no text outside the array. If no issues, return [].`;

export const CODE_REVIEW_HUMAN = (params: {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    context: Pick<PRReviewStateType, "linterResults" | "codeGraph" | "astSummaries" | "importSources" | "prHistory">;
}) => {
    const parts: string[] = [];

    parts.push(`PR: ${params.prTitle}`);
    parts.push(`Changed files: ${params.changedFiles.join(", ")}`);

    if (params.context.linterResults.length > 0) {
        const linterSummary = params.context.linterResults
            .map((i) => `  ${i.filePath}:${i.line} [${i.severity}] ${i.rule}: ${i.message}`)
            .slice(0, 30)
            .join("\n");
        parts.push(`\n=== LINTER / SAST (pre-screened issues — address these first) ===\n${linterSummary}`);
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
        parts.push(`\n=== CODE GRAPH (impact analysis) ===\n${graphSummary}`);
    }

    if (params.context.importSources.length > 0) {
        const importSummary = params.context.importSources
            .slice(0, 5)
            .map((s) => `--- ${s.resolvedPath} (imported by ${s.usedInFile}) ---\n${s.sourceCode.slice(0, 800)}`)
            .join("\n\n");
        parts.push(`\n=== IMPORT SOURCES (dependencies of changed code) ===\n${importSummary}`);
    }

    if (params.context.prHistory.length > 0) {
        const historySummary = params.context.prHistory
            .slice(0, 10)
            .map((h) => `  PR#${h.prNumber} ${h.filePath}:${h.line ?? "?"} by @${h.author}: ${h.body.slice(0, 200)}`)
            .join("\n");
        parts.push(`\n=== PAST PR REVIEW COMMENTS (same files) ===\n${historySummary}`);
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(`\nReview this code for correctness, maintainability, and best practices.`);

    return parts.join("\n");
};
