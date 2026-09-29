import { reviewStatusMeta } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/types/dashboard";
import { DocArticle } from "../DocArticle";
import { A, H2, List, P, Table } from "../DocsPrimitives";

const toc = [
  { id: "summary", label: "The summary" },
  { id: "verdicts", label: "Verdicts" },
  { id: "inline-findings", label: "Inline findings" },
  { id: "statuses", label: "Review statuses" },
];

const statusDescriptions: Record<ReviewStatus, string> = {
  QUEUED: "The event was accepted and the review is waiting for a worker.",
  RUNNING: "A worker is gathering context or the agents are reviewing.",
  RETRYING: "An attempt failed and OpenMerge is trying again automatically.",
  COMPLETED: "Findings and the summary were posted to the pull request.",
  FAILED: "Every attempt failed. The review detail page shows the last error.",
};

export function ReadingReviewsPage() {
  return (
    <DocArticle slug="reading-reviews" toc={toc}>
      <H2 id="summary">The summary</H2>
      <P>When a review finishes, the <strong>Review in progress</strong> note on the pull request is replaced by an <strong>OpenMerge Summary</strong>. It contains:</P>
      <List
        items={[
          "A short overview of what the pull request changes",
          "Up to four bullet points on the most important effects",
          "Whether the pull request is safe to merge, and why",
          "Files needing attention, when there are findings",
          "The verdict",
        ]}
      />

      <H2 id="verdicts">Verdicts</H2>
      <Table
        headers={["Verdict", "Meaning"]}
        rows={[
          [
            <span key="c" className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#d93b3b]" />Changes requested</span>,
            "At least one blocking finding (High or Critical) must be resolved before merging.",
          ],
          [
            <span key="r" className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#d9a61c]" />Review complete</span>,
            "There are suggestions, but none of them block the merge.",
          ],
          [
            <span key="l" className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#1f9d55]" />Looks good to merge</span>,
            "No actionable issues were found in the changed files.",
          ],
        ]}
      />
      <P>A verdict is advice. OpenMerge never approves or blocks the pull request in GitHub, so your branch protection rules stay in control.</P>

      <H2 id="inline-findings">Inline findings</H2>
      <P>Each finding is posted on the line it refers to, in the new version of the file. A finding includes:</P>
      <List
        items={[
          "A severity and a category",
          "What is wrong, why it matters here, and what could go wrong",
          "Replacement code, when a concrete fix is clear",
        ]}
      />
      <P>
        Findings are also saved with the review. Open any review from the <A href="/dashboard/reviews">Reviews</A> page to see them grouped by file and filter them by severity.
      </P>

      <H2 id="statuses">Review statuses</H2>
      <P>The dashboard shows one of these statuses for every review:</P>
      <Table
        headers={["Status", "Meaning"]}
        rows={(Object.keys(statusDescriptions) as ReviewStatus[]).map((status) => [
          <span key={status} className={cn("inline-flex items-center gap-2", reviewStatusMeta[status].text)}>
            <span className={cn("size-2 rounded-full", reviewStatusMeta[status].dot)} aria-hidden="true" />
            {reviewStatusMeta[status].label}
          </span>,
          statusDescriptions[status],
        ])}
      />
    </DocArticle>
  );
}
