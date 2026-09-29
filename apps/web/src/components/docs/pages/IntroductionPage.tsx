import { DocArticle } from "../DocArticle";
import { A, Callout, H2, LinkCards, List, P, Table } from "../DocsPrimitives";

const toc = [
  { id: "what-it-does", label: "What OpenMerge does" },
  { id: "what-it-reviews", label: "What it reviews" },
  { id: "what-it-is-not", label: "What it is not" },
  { id: "next-steps", label: "Next steps" },
];

export function IntroductionPage() {
  return (
    <DocArticle slug="" toc={toc}>
      <P className="mt-8">
        OpenMerge is an open source GitHub App that reviews pull requests. When a pull request is opened or updated, three specialist agents read the change together with context from the rest of your repository. OpenMerge then posts its findings on the exact lines that changed, plus one summary with a clear verdict.
      </P>

      <Callout tone="note" title="OpenMerge is in beta">
        The core review flow is working. Configurable review rules and richer repository memory are still being built. Treat every finding as a suggestion from a colleague, and check it before acting, especially on security-sensitive code.
      </Callout>

      <H2 id="what-it-does">What OpenMerge does</H2>
      <List
        items={[
          <>Starts a review automatically when a pull request is <strong>opened</strong>, <strong>reopened</strong>, or receives <strong>new commits</strong>.</>,
          <>Gathers context beyond the diff: AST summaries, a code graph of callers, resolved imports, linter output, and past pull requests that touched the same files.</>,
          <>Runs code, security, and performance agents in parallel on the same change.</>,
          <>Removes duplicates, ranks findings by severity, and posts at most 12 comments so the review stays readable.</>,
          <>Keeps a history of every review in your dashboard, where you can also pause automatic review per repository.</>,
        ]}
      />

      <H2 id="what-it-reviews">What it reviews</H2>
      <P>Each agent focuses on one kind of risk. See <A href="/docs/agents">Agents and severity</A> for the full lists.</P>
      <Table
        headers={["Agent", "Looks for"]}
        rows={[
          ["Code", "Logic bugs, edge cases that fail in common use, missing tests, and changes that are hard to maintain."],
          ["Security", "Injection, authentication and authorization gaps, leaked secrets or personal data, SSRF, XSS, and suspicious new dependencies."],
          ["Performance", "N+1 queries, missing indexes, blocking work on the event loop, unbounded fetches, and memory leaks."],
        ]}
      />

      <H2 id="what-it-is-not">What it is not</H2>
      <P>
        OpenMerge is an additional reviewer, not an approval bot. It never approves, merges, or pushes code, and it does not replace your team&apos;s judgment about product requirements. It comments only when it has something actionable to say, and the decision to merge stays with you.
      </P>

      <H2 id="next-steps">Next steps</H2>
      <LinkCards
        cards={[
          { href: "/docs/quick-start", title: "Quick start", description: "Install the GitHub App and get your first review." },
          { href: "/docs/how-it-works", title: "How a review works", description: "Follow a pull request through all five stages." },
          { href: "/docs/reading-reviews", title: "Reading a review", description: "Understand the summary, verdicts, and statuses." },
          { href: "/docs/self-hosting", title: "Self-hosting", description: "Run OpenMerge on your own infrastructure." },
        ]}
      />
    </DocArticle>
  );
}
