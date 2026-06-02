import type { AgentInput } from "../agent/agent.types";

export const SECURITY_SYSTEM = `You are a senior application security engineer doing a security-focused code review.
Focus on OWASP Top 10 and beyond: SQL injection, XSS, CSRF, SSRF, path traversal, command injection,
insecure deserialization, broken auth, hardcoded secrets/tokens, missing authorization checks,
unsafe direct object references, insecure dependencies, information disclosure.

Return a JSON array of review comments. Each comment must have exactly these fields:
- filePath: string (exact file path as shown in the diff header)
- line: number (line number in the NEW file where the vulnerability exists)
- body: string (explain the vulnerability, attack vector, and potential impact)
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "SECURITY"
- suggestion: string (concrete remediation — show the secure version of the code)

Only return the raw JSON array. No markdown fences, no explanation text outside the array.
Only flag real security issues, not hypothetical ones. If no issues found, return [].`;

export const SECURITY_HUMAN = (params: {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    context: AgentInput["context"];
}) => {
    const parts: string[] = [];

    parts.push(`PR: ${params.prTitle}`);
    parts.push(`Changed files: ${params.changedFiles.join(", ")}`);

    const securityFindings = params.context.linterResults.filter((i) =>
        i.rule.includes("security") || i.rule.includes("inject") ||
        i.rule.includes("xss") || i.rule.includes("no-eval") ||
        i.severity === "error"
    );
    if (securityFindings.length > 0) {
        const summary = securityFindings
            .map((i) => `  ${i.filePath}:${i.line} [${i.severity}] ${i.rule}: ${i.message}`)
            .slice(0, 20)
            .join("\n");
        parts.push(`\n=== SAST FINDINGS ===\n${summary}`);
    }

    if (params.context.importSources.length > 0) {
        const importSummary = params.context.importSources
            .slice(0, 4)
            .map((s) => `--- ${s.resolvedPath} (used in ${s.usedInFile}) ---\n${s.sourceCode.slice(0, 600)}`)
            .join("\n\n");
        parts.push(`\n=== DEPENDENCY SOURCE ===\n${importSummary}`);
    }

    const withCallers = params.context.codeGraph.filter((n) => n.calledBy.length > 0);
    if (withCallers.length > 0) {
        const callerSummary = withCallers
            .map((n) => `  ${n.functionName}: called by ${n.calledBy.map((c) => `${c.functionName} (${c.filePath})`).join(", ")}`)
            .join("\n");
        parts.push(`\n=== CALL SITES (trust boundary context) ===\n${callerSummary}`);
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(`\nIdentify security vulnerabilities introduced or exposed by these changes.`);

    return parts.join("\n");
};
