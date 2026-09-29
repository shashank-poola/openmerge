import { DocArticle } from "../DocArticle";
import { GITHUB_APP_URL } from "../docs-nav";
import { A, Callout, Code, H2, List, P, Steps } from "../DocsPrimitives";

const toc = [
  { id: "install", label: "Install OpenMerge" },
  { id: "first-review", label: "Get your first review" },
  { id: "what-you-will-see", label: "What you will see" },
];

export function QuickStartPage() {
  return (
    <DocArticle slug="quick-start" toc={toc}>
      <H2 id="install">Install OpenMerge</H2>
      <P>You need a GitHub account with permission to install apps on the repositories you want reviewed.</P>
      <Steps
        steps={[
          {
            title: "Sign in with GitHub",
            body: <>Click <strong>Get started</strong> on the OpenMerge home page and authorize with your GitHub account.</>,
          },
          {
            title: "Install the GitHub App",
            body: (
              <>
                Choose the account or organization, then pick <strong>Only select repositories</strong> or <strong>All repositories</strong>. You can also start from the <A href={GITHUB_APP_URL}>GitHub App page</A>.
              </>
            ),
          },
          {
            title: "Let OpenMerge activate",
            body: <>GitHub sends you back to OpenMerge, which registers the repositories you selected. When it finishes, your dashboard opens.</>,
          },
        ]}
      />

      <H2 id="first-review">Get your first review</H2>
      <P>
        Open a pull request in one of the selected repositories, or push a new commit to one that is already open. There is nothing to configure and nothing to add to your CI. OpenMerge reacts to the <Code>opened</Code>, <Code>reopened</Code>, and <Code>synchronize</Code> (new commits) events from GitHub.
      </P>
      <Callout tone="tip" title="Each commit is reviewed once">
        OpenMerge reviews the latest commit of the pull request. Push another commit to get a fresh review of the updated code.
      </Callout>

      <H2 id="what-you-will-see">What you will see</H2>
      <List
        items={[
          <>A short <strong>Review in progress</strong> note appears on the pull request as soon as the review is queued.</>,
          <>Findings are posted as <strong>inline comments</strong> on the changed lines, each with a severity and, where it helps, suggested code.</>,
          <>The progress note is replaced by a <strong>summary</strong> with a verdict: changes requested, non-blocking suggestions, or looks good to merge.</>,
          <>The review also appears on the <A href="/dashboard/reviews">Reviews</A> page of your dashboard.</>,
        ]}
      />
      <P>
        Nothing showing up? See <A href="/docs/troubleshooting">Troubleshooting</A>.
      </P>
    </DocArticle>
  );
}
