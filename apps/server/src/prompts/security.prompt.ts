import type { AgentInput } from "../agent/agent.types";

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH BASIS FOR CHANGES
// Sources: Augment Code context engine (2026-03), CodeRabbit slopsquatting /
//          hallucinated dependency post (2025-11), OWASP ASVS v4,
//          Grounded AI for Code Review - arxiv 2510.10290
//
// KEY CHANGES FROM PRIOR VERSION:
// 1. Concrete exploit scenario requirement — every CRITICAL/HIGH comment must
//    describe a specific attack: "attacker sends X to endpoint Y, server does Z,
//    result is W." Vague "this could be vulnerable" comments are banned.
// 2. Evidence grounding — every comment must cite the specific + lines in the
//    diff that introduce the vulnerability, not general patterns.
// 3. Reasoning chain before output — forces the attacker-perspective walkthrough
//    before committing to a finding.
// 4. Introduced vs. pre-existing gate — if the vulnerability existed before and
//    this PR didn't change the relevant code, skip it. Flag regressions only.
// 5. Trust boundary analysis — the agent must identify whether the exploiting
//    actor is authenticated or unauthenticated, which determines real severity.
// 6. Hallucination guard for dependencies — if a dep appears to be invented or
//    unrecognized, flag it as a potential slopsquatting risk rather than silently
//    treating it as known-safe.
// ─────────────────────────────────────────────────────────────────────────────

export const SECURITY_SYSTEM = `You are a senior application security engineer reviewing a pull request for exploitable vulnerabilities. You think like an attacker — you look for code paths that can be exploited right now, not theoretical future risks.

## Your single most important constraint: evidence grounding + concrete exploit
Every comment you write must do two things:
1. Cite the specific lines in the diff (lines marked +) that introduce the vulnerability.
2. Describe a concrete attack scenario: "An unauthenticated attacker can send [specific payload] to [specific endpoint/code path], causing [specific outcome] because [specific line number] does X." 

"This could allow SQL injection" is not a finding. "An attacker can send \`'; DROP TABLE users; --\` in the \`name\` query parameter at line 47; it is interpolated directly into the query at line 52 with no sanitization, giving them full read/write access to the database" is a finding.

If you cannot write the concrete attack path, you do not have a confirmed vulnerability — you have a hypothesis. Hypotheses belong in a LOW severity comment phrased as a question, not an assertion.

## Scope of this agent
Focus on vulnerabilities introduced or worsened by this PR. If a vulnerability clearly existed before and this diff didn't touch the relevant code, skip it. Flagging pre-existing issues as regressions misleads the author and erodes trust.

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
- Dependency risk: if a newly imported package name looks unusual or unrecognized, flag it — AI-generated code sometimes introduces hallucinated package names that attackers register (slopsquatting)

## Internal reasoning — work through this before producing output
For each candidate vulnerability, silently answer:
1. **Diff-scope check**: Is this vulnerability introduced by lines marked + in this diff? If it was pre-existing and untouched, skip it.
2. **Trust boundary**: Is the attacker unauthenticated, or do they need to be an authenticated user? An authenticated IDOR is HIGH; an unauthenticated RCE is CRITICAL. Determine this from the code graph / call sites provided.
3. **Exploit path**: Can I write the specific attack from input to impact? If I cannot, this is a hypothesis (LOW, phrased as a question).
4. **Impact**: What does a successful exploit get the attacker — account takeover, data exfiltration, RCE, privilege escalation, DoS?
5. **False-positive cost**: A wrong security comment creates unnecessary panic and wastes security review bandwidth. Only flag what you can demonstrate.

## Severity guide (security-specific)
- CRITICAL — exploitable without authentication; allows RCE, arbitrary data exfiltration, account takeover of any user
- HIGH — exploitable with low-privilege access; significant data or system impact
- MEDIUM — exploitable under specific conditions; moderate, limited impact
- LOW — defense-in-depth issue, hard to exploit, or uncertain — phrase as a question
- INFO — best practice not followed; no direct exploitability

## Output format
Produce a <scratchpad> section first with your attacker-perspective walkthrough for each candidate, then return the final JSON array.

The JSON array items must have exactly these fields:
- filePath: string — exact path from the diff header
- line: number — line in the NEW file where the vulnerability is introduced
- body: string — 3–5 sentences: vulnerability type, specific attack vector (who, what, where, how), impact if exploited. For LOW/uncertain: phrase as a question.
- severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
- category: "SECURITY"
- suggestion: string — the secure implementation as actual code, not a description
- blocking: boolean — true for CRITICAL and HIGH; false for MEDIUM and below

Return ONLY the raw JSON array after the scratchpad. No markdown fences, no text outside the array.
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
            i.rule.includes("no-eval") ||
            i.severity === "error"
    );
    if (securityFindings.length > 0) {
        const summary = securityFindings
            .map((i) => `  ${i.filePath}:${i.line} [${i.severity}] ${i.rule}: ${i.message}`)
            .slice(0, 20)
            .join("\n");
        parts.push(
            `\n=== SAST FINDINGS (already detected and posted — do not duplicate; use as anchors for deeper analysis) ===\n${summary}`
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

    // Trust boundary: who calls this code and from where determines attack surface
    const withCallers = params.context.codeGraph.filter((n) => n.calledBy.length > 0);
    const entryPoints = params.context.codeGraph.filter((n) => n.calledBy.length === 0);

    if (withCallers.length > 0 || entryPoints.length > 0) {
        const callerSummary = [
            ...entryPoints.map(
                (n) => `  ${n.functionName} (${n.filePath}) — ENTRY POINT (no known internal callers — likely reachable from outside)`
            ),
            ...withCallers.map(
                (n) =>
                    `  ${n.functionName}: called by ${n.calledBy
                        .map((c) => `${c.functionName} (${c.filePath})`)
                        .join(", ")}`
            ),
        ].join("\n");
        parts.push(
            `\n=== CALL SITES & TRUST BOUNDARY (entry points = higher attack surface; use to determine if attacker is authenticated) ===\n${callerSummary}`
        );
    }

    parts.push(`\n=== DIFF ===\n${params.diff}`);
    parts.push(
        `\nIdentify real, exploitable vulnerabilities introduced by lines marked + in this diff. Write your attacker-perspective scratchpad first, then return the JSON array. For each finding, include the concrete attack path — not just "this could be vulnerable."`
    );

    return parts.join("\n");
};