import { DocArticle } from "../DocArticle";
import { A, Callout, Code, H2, List, P } from "../DocsPrimitives";

const toc = [
  { id: "no-review", label: "No review appeared" },
  { id: "needs-attention", label: "Review needs attention" },
  { id: "stuck", label: "Review seems stuck" },
  { id: "fewer-comments", label: "Fewer comments than expected" },
  { id: "signed-out", label: "Session expired" },
];

export function TroubleshootingPage() {
  return (
    <DocArticle slug="troubleshooting" toc={toc}>
      <H2 id="no-review">No review appeared</H2>
      <P>Work through these checks in order:</P>
      <List
        items={[
          <>The repository is selected in the GitHub App installation, and it appears on the <A href="/dashboard/repositories">Repositories</A> page. If not, update access in GitHub and click <strong>Sync from GitHub</strong>.</>,
          <>Auto-review is switched on for the repository.</>,
          <>The GitHub App installation is not suspended.</>,
          <>The pull request was opened, reopened, or received new commits. Editing the title or description, commenting, or requesting a review does not start one.</>,
          <>The same commit was not already reviewed. Push a new commit to review the latest code.</>,
        ]}
      />

      <H2 id="needs-attention">Review needs attention</H2>
      <P>
        OpenMerge already retried the review automatically before showing this status. Open the review from the <A href="/dashboard/reviews">Reviews</A> page to read the last error, then push a new commit or close and reopen the pull request to try again.
      </P>

      <H2 id="stuck">Review seems stuck</H2>
      <P>
        Reviews show <strong>Queued</strong>, <strong>Reviewing</strong>, or <strong>Retrying</strong> while work is in progress, and the dashboard refreshes on its own. Large pull requests take longer. If a worker stops mid-review, the review is recovered and queued again automatically.
      </P>
      <Callout tone="warning" title="Self-hosting?">
        Check that the worker process is running and can reach Redis and PostgreSQL. Reviews stay queued while no worker is available. See <A href="/docs/self-hosting">Self-hosting</A>.
      </Callout>

      <H2 id="fewer-comments">Fewer comments than expected</H2>
      <P>
        This is by design. Duplicates are dropped and each review posts at most 12 comments, highest severity first. The security agent also skips problems that existed before the pull request. The summary and the review detail page show everything that was posted.
      </P>

      <H2 id="signed-out">Session expired</H2>
      <P>
        Dashboard sessions last seven days. When yours expires, the dashboard shows a <strong>Sign in with GitHub</strong> button. Signing in again does not affect reviews, which keep running whether or not you are signed in. The API reports this state as <Code>INVALID_TOKEN</Code> or <Code>TOKEN_REQUIRED</Code>.
      </P>
    </DocArticle>
  );
}
