import { DocArticle } from "../DocArticle";
import { GITHUB_APP_URL } from "../docs-nav";
import { A, Callout, H2, List, P, Steps } from "../DocsPrimitives";

const toc = [
  { id: "add", label: "Add repositories" },
  { id: "sync", label: "Sync after changes" },
  { id: "pause", label: "Pause automatic review" },
  { id: "rerun", label: "Run a review again" },
  { id: "remove", label: "Remove OpenMerge" },
];

export function RepositoriesPage() {
  return (
    <DocArticle slug="repositories" toc={toc}>
      <H2 id="add">Add repositories</H2>
      <P>Repository access is managed in GitHub, not in OpenMerge.</P>
      <Steps
        steps={[
          { title: "Open the GitHub App settings", body: <>Click <strong>Add repositories</strong> in the dashboard, or open the <A href={GITHUB_APP_URL}>GitHub App page</A>.</> },
          { title: "Update repository access", body: <>Select the extra repositories, or switch to <strong>All repositories</strong>, and save.</> },
          { title: "Sync OpenMerge", body: <>Go to <A href="/dashboard/repositories">Repositories</A> and click <strong>Sync from GitHub</strong> so the new access is picked up.</> },
        ]}
      />

      <H2 id="sync">Sync after changes</H2>
      <P>
        <strong>Sync from GitHub</strong> reads the current repository list from your installation. New repositories are added, and repositories you removed from the app stop being reviewed. Run it whenever you change access in GitHub.
      </P>

      <H2 id="pause">Pause automatic review</H2>
      <P>
        Each repository on the <A href="/dashboard/repositories">Repositories</A> page has an auto-review switch. While it is off, pull request events for that repository are ignored. Turning it back on applies to the next pull request event; past commits are not reviewed retroactively.
      </P>

      <H2 id="rerun">Run a review again</H2>
      <P>OpenMerge reviews each commit once. To get a new review:</P>
      <List
        items={[
          <><strong>Push a new commit</strong> to the pull request. This is the usual way, and it reviews the latest code.</>,
          <><strong>Close and reopen</strong> the pull request if the last review ended in <strong>Needs attention</strong>. A finished review of the same commit is not repeated.</>,
        ]}
      />

      <H2 id="remove">Remove OpenMerge</H2>
      <P>Uninstall the app from your GitHub settings under <strong>Applications → Installed GitHub Apps</strong>. OpenMerge marks the installation as removed and stops reviewing its repositories. Suspending the app pauses reviews in the same way until you unsuspend it.</P>
      <Callout tone="note">Signing out of the dashboard only ends your browser session. It does not uninstall the GitHub App or stop reviews.</Callout>
    </DocArticle>
  );
}
