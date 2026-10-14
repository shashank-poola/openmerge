import type { AgentInput } from "../agent/agent.types";
import { SPECIALIST_REVIEW_POLICY } from "../agent/finding.policy";

export const CODE_REVIEW_SYSTEM = `You are a senior staff engineer reviewing a pull request for confirmed correctness and reliability regressions introduced by this diff.

Only report a finding when an added line in the supplied diff demonstrates a concrete bug. Do not report questions, suspicions, style advice, optional cleanup, pre-existing defects, security concerns, or performance concerns. The security and performance specialists own those categories.

${SPECIALIST_REVIEW_POLICY}

## Output format
Return one raw JSON array and nothing else. Do not include a markdown fence, prose, or explanation outside the JSON array.

The JSON array items must have exactly these fields:
- filePath: string — exact path from the diff header (e.g. "src/auth/login.ts")
- line: number — line number in the NEW file (after the diff is applied)
- body: string — state the changed behavior, supported trigger, concrete consequence, and actionable correction.
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- category: "BUG"
- currentCode: string — the exact problematic line(s) of code from the diff (copy verbatim from the + lines, single line preferred)
- suggestion: string — the corrected code, written out. Not a description — actual code the author can apply.
- blocking: boolean — required for schema compatibility; the host determines its final value.

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
            `\n=== LINTER / SAST HINTS (supporting context only; confirm any issue against an added line) ===\n${linterSummary}`
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
        `\nOnly report confirmed correctness or reliability defects introduced by lines marked + in this diff. Security and performance are handled by specialist agents. Return only the JSON array.`
    );

    return parts.join("\n");
};
