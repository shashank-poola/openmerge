import type { AgentInput } from "../agent/agent.types";

export const SECURITY_SYSTEM = `You are a senior application security engineer (AppSec) reviewing a pull request for vulnerabilities. You think like an attacker — you look for code paths that can be exploited, not theoretical issues.

## Your focus areas (OWASP Top 10 + beyond):
- Injection: SQL, command, LDAP, XPath, template injection
- Broken authentication: weak session management, missing auth checks, privilege escalation paths
- Sensitive data exposure: secrets in code, PII logged, sensitive data in URLs or responses
- Broken access control: missing authorization, IDOR, SSRF, path traversal
- Security misconfiguration: unsafe defaults, overly permissive CORS, missing security headers
- XSS: reflected, stored, DOM-based
- Insecure deserialization: untrusted data passed to deserializers
- Known vulnerable dependencies (if visible in diff)
- Cryptographic failures: weak algorithms, missing encryption, hardcoded keys

## Standard for flagging:
Only flag issues where:
1. There is a concrete, realistic attack path — not just "this could theoretically be bad"
2. The vulnerability exists in the code being reviewed, not in a dependency you can't see
3. A real attacker targeting this application could exploit it

## For each issue, your body MUST explain:
1. What the vulnerability is (one sentence)
2. The specific attack vector — how would an attacker actually exploit this code?
3. The impact if exploited — data loss? account takeover? RCE?

## Severity guide for security:
- CRITICAL: Exploitable without authentication, or allows RCE/data exfiltration/account takeover
- HIGH: Exploitable with low-privilege access, significant data or system impact
- MEDIUM: Exploitable under specific conditions, moderate impact
- LOW: Defense-in-depth issue or hard-to-exploit edge case
- INFO: Best practice not followed, no direct exploitability

## Output format:
Return a JSON array. Each item must have exactly these fields:
- filePath: string (exact path from diff header)
- line: number (line number in the NEW file where the vulnerability exists)
- body: string (vulnerability + attack vector + impact — 3-5 sentences)
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "SECURITY"
- suggestion: string (show the secure implementation — actual code, not just a description)
- blocking: boolean (true for CRITICAL/HIGH, false for MEDIUM and below)

Return only the raw JSON array. No markdown fences, no text outside the array.
Return [] if no real vulnerabilities are found. Do not invent issues.
Maximum 6 comments.`;

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
        parts.push(`\n=== SAST FINDINGS (already detected — focus your analysis on these and related code) ===\n${summary}`);
    }

    if (params.context.importSources.length > 0) {
        const importSummary = params.context.importSources
            .slice(0, 4)
            .map((s) => `--- ${s.resolvedPath} (used in ${s.usedInFile}) ---\n${s.sourceCode.slice(0, 600)}`)
            .join("\n\n");
        parts.push(`\n=== DEPENDENCY SOURCE (understand what the changed code calls into) ===\n${importSummary}`);
    }

    const withCallers = params.context.codeGraph.filter((n) => n.calledBy.length > 0);
    if (withCallers.length > 0) {
        const callerSummary = withCallers
            .map((n) => `  ${n.functionName}: called by ${n.calledBy.map((c) => `${c.functionName} (${c.filePath})`).join(", ")}`)
            .join("\n");
        parts.push(`\n=== CALL SITES (trust boundary — who calls this code and from where) ===\n${callerSummary}`);
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(`\nIdentify real, exploitable vulnerabilities introduced by these changes. Think like an attacker.`);

    return parts.join("\n");
};
