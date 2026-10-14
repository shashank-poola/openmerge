import type { AgentInput } from "../agent/agent.types";
import { SPECIALIST_REVIEW_POLICY } from "../agent/finding.policy";

export const SECURITY_SYSTEM = `You are a senior application security engineer reviewing a pull request for demonstrated vulnerabilities introduced or worsened by this diff.

Report only an added line with a demonstrated trust boundary and concrete attack path from attacker-controlled input to security impact. A missing static caller, an unfamiliar package name, a generic linter error, or a theoretical sink is not evidence of reachability or exploitability. Do not report questions, hypotheses, best practices, or pre-existing vulnerabilities.

## Your focus areas (OWASP Top 10 + critical real-world patterns)
- Injection: SQL, command, LDAP, XPath, template injection, NoSQL injection
- Authentication bypass: missing auth checks on new routes/handlers, weak session handling
- Authorization / access control: IDOR (accessing another user's resource by ID), missing ownership checks, privilege escalation paths
- Sensitive data exposure: secrets or PII in logs, sensitive fields in API responses, tokens in URLs
- SSRF: user-controlled URLs fetched server-side without allowlist validation
- Path traversal: user-controlled file paths without canonicalization/sandboxing
- XSS: reflected, stored, or DOM-based — especially new rendering of user-controlled content
- Insecure deserialization: untrusted data passed to JSON.parse with reviver, eval, or deserializers
- Cryptographic failures: hardcoded secrets, weak algorithms (MD5/SHA1 for security), missing encryption on sensitive fields
${SPECIALIST_REVIEW_POLICY}

## Output format
Return one raw JSON array and nothing else. Do not include a markdown fence, prose, or explanation outside the JSON array.

The JSON array items must have exactly these fields:
- filePath: string — exact path from the diff header
- line: number — line in the NEW file where the vulnerability is introduced
- body: string — state the changed behavior, supported trust boundary and attack trigger, concrete impact, and actionable correction.
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- category: "SECURITY"
- currentCode: string — the exact vulnerable line(s) of code from the diff (copy verbatim from the + lines, single line preferred)
- suggestion: string — the secure implementation as actual code, not a description
- blocking: boolean — required for schema compatibility; the host determines its final value.

Return [] if no real vulnerabilities are found. Do not invent issues.
Maximum 6 comments — only confirmed or high-confidence findings.`;

export const SECURITY_HUMAN = (params: {
    prTitle: string;
    changedFiles: string[];
    diff: string;
    context: AgentInput["context"];
}) => {
    const parts: string[] = [];

    parts.push(`PR: ${params.prTitle}`);
    parts.push(`Changed files: ${params.changedFiles.join(", ")}`);

    // Surface SAST findings that are security-relevant
    const securityFindings = params.context.linterResults.filter(
        (i) =>
            i.rule.includes("security") ||
            i.rule.includes("inject") ||
            i.rule.includes("xss") ||
            i.rule.includes("no-eval")
    );
    if (securityFindings.length > 0) {
        const summary = securityFindings
            .map((i) => `  ${i.filePath}:${i.line} [${i.severity}] ${i.rule}: ${i.message}`)
            .slice(0, 20)
            .join("\n");
        parts.push(
            `\n=== SECURITY SAST HINTS (supporting context only; require a changed-line attack path before reporting) ===\n${summary}`
        );
    }

    if (params.context.importSources.length > 0) {
        const importSummary = params.context.importSources
            .slice(0, 4)
            .map(
                (s) =>
                    `--- ${s.resolvedPath} (used in ${s.usedInFile}) ---\n${s.sourceCode.slice(0, 600)}`
            )
            .join("\n\n");
        parts.push(
            `\n=== DEPENDENCY SOURCE (understand the security contracts of what the changed code calls into) ===\n${importSummary}`
        );
    }

    // Static call graph coverage is incomplete and does not establish reachability.
    const withCallers = params.context.codeGraph.filter((n) => n.calledBy.length > 0);
    const entryPoints = params.context.codeGraph.filter((n) => n.calledBy.length === 0);

    if (withCallers.length > 0 || entryPoints.length > 0) {
        const callerSummary = [
            ...entryPoints.map(
                (n) => `  ${n.functionName} (${n.filePath}) — no known internal callers in this analysis`
            ),
            ...withCallers.map(
                (n) =>
                    `  ${n.functionName}: called by ${n.calledBy
                        .map((c) => `${c.functionName} (${c.filePath})`)
                        .join(", ")}`
            ),
        ].join("\n");
        parts.push(
            `\n=== STATIC CALL SITES (context only; absence of callers does not establish external reachability or authentication state) ===\n${callerSummary}`
        );
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(
        `\nIdentify only demonstrated vulnerabilities introduced by lines marked + in this diff. Each finding needs a supported trust boundary and concrete attack path. Return only the JSON array.`
    );

    return parts.join("\n");
};
