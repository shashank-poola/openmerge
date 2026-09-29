import { severityMeta, severityOrder } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { DocArticle } from "../DocArticle";
import { Callout, Code, H2, List, P, Table } from "../DocsPrimitives";

const toc = [
  { id: "code", label: "Code agent" },
  { id: "security", label: "Security agent" },
  { id: "performance", label: "Performance agent" },
  { id: "severity", label: "Severity levels" },
  { id: "categories", label: "Categories" },
];

const severityDefinitions: Record<(typeof severityOrder)[number], string> = {
  CRITICAL: "Breaks the main flow: data loss, a security bypass, or a crash under normal conditions.",
  HIGH: "Fails in common edge cases or significantly degrades reliability or performance.",
  MEDIUM: "A real problem that should be fixed before merging, but will not cause an immediate outage.",
  LOW: "Worth a follow-up, not a blocker.",
  INFO: "An observation; no action required.",
};

export function AgentsPage() {
  return (
    <DocArticle slug="agents" toc={toc}>
      <P className="mt-8">
        Three agents review every pull request in parallel. Each has a narrow focus, so findings stay specific instead of repeating each other.
      </P>

      <H2 id="code">Code agent</H2>
      <P>Looks for correctness and maintainability problems in the changed code:</P>
      <List
        items={[
          "Logic bugs and incorrect behavior in the main flow",
          "Edge cases that fail in common use",
          "Missing or insufficient tests for the change",
          "Code that is hard to follow or refactor safely",
        ]}
      />
      <P>
        When the agent proposes a fix, the <Code>suggestion</Code> is actual code you can apply, not a description.
      </P>

      <H2 id="security">Security agent</H2>
      <P>Reviews like an attacker, based on the OWASP Top 10 and common real-world patterns:</P>
      <List
        items={[
          "Injection: SQL, NoSQL, command, and template injection",
          "Missing authentication on new routes and weak session handling",
          "Access control gaps, such as reading another user's record by ID",
          "Secrets or personal data in logs, responses, or URLs",
          "SSRF, path traversal, XSS, and unsafe deserialization",
          "Hardcoded secrets and weak cryptography",
          "Unusual or unrecognized new package names that may be typo or hallucinated dependencies",
        ]}
      />
      <Callout tone="note">
        The security agent flags only issues this pull request introduced or made worse. Problems that already existed in untouched code are skipped, so they are not reported as regressions.
      </Callout>

      <H2 id="performance">Performance agent</H2>
      <List
        items={[
          "N+1 queries: a database query inside a loop",
          "Missing indexes on columns the change filters, sorts, or joins on",
          "Synchronous or blocking work in async code paths",
          "Unbounded fetches with no limit or pagination",
          "Memory leaks, such as listeners registered without cleanup",
          "Expensive work in hot paths and sequential awaits that could run in parallel",
          "Large payloads when only a few fields are needed",
        ]}
      />

      <H2 id="severity">Severity levels</H2>
      <P>Every finding has one of five severities. High and Critical findings are treated as blocking.</P>
      <Table
        headers={["Severity", "Meaning"]}
        rows={severityOrder.map((severity) => [
          <span key={severity} className="inline-flex items-center gap-2">
            <span className={cn("size-2 rounded-full", severityMeta[severity].dot)} aria-hidden="true" />
            {severityMeta[severity].label}
          </span>,
          severityDefinitions[severity],
        ])}
      />

      <H2 id="categories">Categories</H2>
      <P>Findings are also labeled with a category, which you can see on each finding in the dashboard:</P>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Bug", "Security", "Performance", "Style", "Refactor", "Documentation", "Test", "Other"].map((category) => (
          <span key={category} className="rounded-md border border-[#ebebe8] bg-[#fafaf9] px-2.5 py-1 text-[13px] text-[#3f3f3c]">
            {category}
          </span>
        ))}
      </div>
    </DocArticle>
  );
}
