import { DocArticle } from "../DocArticle";
import { A, Callout, Code, H2, List, P, Table } from "../DocsPrimitives";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "trigger", label: "1. Trigger" },
  { id: "context", label: "2. Context" },
  { id: "agents", label: "3. Agents" },
  { id: "filter", label: "4. Filter" },
  { id: "post", label: "5. Post" },
  { id: "reliability", label: "Retries and recovery" },
];

const stages = ["Trigger", "Context", "Agents", "Filter", "Post"];

export function HowItWorksPage() {
  return (
    <DocArticle slug="how-it-works" toc={toc}>
      <H2 id="overview">Overview</H2>
      <P>Every review runs the same five stages. The API receives the GitHub event and queues a job; a separate worker runs the review and posts the result.</P>
      <div className="mt-6 grid grid-cols-5 overflow-hidden rounded-xl border border-[#ebebe8] text-center">
        {stages.map((stage, index) => (
          <div key={stage} className={index > 0 ? "border-l border-[#ebebe8] px-2 py-3" : "px-2 py-3"}>
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#a3a39e]">{String(index + 1).padStart(2, "0")}</p>
            <p className="mt-0.5 text-[13px] font-semibold text-[#171717]">{stage}</p>
          </div>
        ))}
      </div>

      <H2 id="trigger">1. Trigger</H2>
      <P>
        GitHub calls <Code>POST /api/v1/webhook/github</Code> for pull request events. OpenMerge verifies the <Code>X-Hub-Signature-256</Code> header, then starts a review only for these actions:
      </P>
      <Table
        headers={["Action", "When it happens"]}
        rows={[
          [<Code key="o">opened</Code>, "A pull request is created."],
          [<Code key="s">synchronize</Code>, "New commits are pushed to the pull request."],
          [<Code key="r">reopened</Code>, "A closed pull request is reopened."],
        ]}
      />
      <P>The event is ignored when the repository is not connected, automatic review is paused for it, or the GitHub App installation is suspended.</P>
      <P>
        Each review is tied to one commit. If a review for the same repository, pull request, and head commit is already running or finished, OpenMerge does not start another. When the review is queued, a <strong>Review in progress</strong> note is posted on the pull request.
      </P>

      <H2 id="context">2. Context</H2>
      <P>The worker fetches the pull request, its diff, and the changed files, clones the repository, and then gathers five kinds of context in parallel:</P>
      <Table
        headers={["Source", "What it adds"]}
        rows={[
          ["AST summaries", "The functions, classes, and types the change touches."],
          ["Code graph", "Where the changed symbols are used elsewhere in the repository."],
          ["Resolved imports", "The modules the new code depends on."],
          ["Linter output", "Existing warnings on the changed files."],
          ["PR history", "Earlier pull requests that touched the same files."],
        ]}
      />
      <Callout tone="note">If the clone or any single source fails, the review continues with the context that is available rather than failing.</Callout>

      <H2 id="agents">3. Agents</H2>
      <P>
        The code, security, and performance agents run at the same time on the same diff and context. Each one returns findings with a file, a line in the new version of the file, a severity, a category, an explanation, and, where it helps, replacement code. See <A href="/docs/agents">Agents and severity</A>.
      </P>

      <H2 id="filter">4. Filter</H2>
      <List
        items={[
          <>Duplicates are dropped: two findings on the same file and line with the same opening text count as one.</>,
          <>Findings are ranked from Critical to Info.</>,
          <>Blocking findings (High and Critical, unless an agent marks one non-blocking) go first.</>,
          <>The list is capped at <strong>12 comments</strong> per review.</>,
        ]}
      />

      <H2 id="post">5. Post</H2>
      <P>
        Findings are posted as inline comments on the changed lines, and the progress note is replaced by the summary. The session, its findings, and its timing are saved, so the review appears on your dashboard. See <A href="/docs/reading-reviews">Reading a review</A>.
      </P>

      <H2 id="reliability">Retries and recovery</H2>
      <List
        items={[
          <>A failed attempt is retried automatically with exponential backoff, up to 10 attempts. The dashboard shows these as <strong>Retrying</strong>.</>,
          <>Workers send heartbeats while reviewing. If a worker stops, the stalled review is recovered and queued again.</>,
          <>If every attempt fails, the review is marked <strong>Needs attention</strong> with the last error. See <A href="/docs/troubleshooting">Troubleshooting</A>.</>,
        ]}
      />
    </DocArticle>
  );
}
