"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert02Icon, ArrowLeft01Icon, ExternalLinkIcon, FileCodeIcon, GitBranchIcon, HashIcon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { DotmSquare3 } from "@/components/ui/dotm-square-3";
import { getReview } from "@/lib/api";
import { formatDateTime, formatDuration, formatRelativeTime, githubPullRequestUrl, pluralize, severityMeta, severityOrder } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { CommentSeverity, ReviewComment, ReviewDetailResponse } from "@/types/dashboard";
import { buttonStyles, DashboardIcon, DashboardLoading, ErrorPanel, InlineError, Panel, SeverityBadge, StatusBadge } from "./DashboardPrimitives";

export function ReviewDetailScreen({ reviewId }: { reviewId: string }) {
  const [data, setData] = useState<ReviewDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<CommentSeverity | null>(null);

  const loadReview = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setData(await getReview(reviewId));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this review.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reviewId]);

  useEffect(() => {
    void loadReview();
  }, [loadReview]);

  const activeReview = data?.review.status === "QUEUED" || data?.review.status === "RUNNING" || data?.review.status === "RETRYING";

  useEffect(() => {
    if (!activeReview) return;

    const intervalId = window.setInterval(() => void loadReview(true), 5_000);
    return () => window.clearInterval(intervalId);
  }, [activeReview, loadReview]);

  const comments = useMemo(() => data?.review.comments ?? [], [data]);

  const severityCounts = useMemo(() => {
    const counts = new Map<CommentSeverity, number>(severityOrder.map((severity) => [severity, 0]));
    comments.forEach((comment) => counts.set(comment.severity, (counts.get(comment.severity) ?? 0) + 1));
    return counts;
  }, [comments]);

  const commentsByFile = useMemo(() => {
    const groups = new Map<string, ReviewComment[]>();
    comments
      .filter((comment) => !severityFilter || comment.severity === severityFilter)
      .forEach((comment) => groups.set(comment.filePath, [...(groups.get(comment.filePath) ?? []), comment]));
    return [...groups.entries()];
  }, [comments, severityFilter]);

  if (loading && !data) {
    return <DashboardLoading label="Loading review details" />;
  }

  if (error && !data) {
    return (
      <ErrorPanel
        error={error}
        title="This review could not be loaded"
        description={error === "REVIEW_NOT_FOUND" ? "The review is unavailable, or it belongs to a repository that is no longer connected." : undefined}
        onRetry={() => void loadReview()}
      />
    );
  }

  const review = data?.review;
  if (!review) return null;

  const highestSeverity = severityOrder.find((severity) => (severityCounts.get(severity) ?? 0) > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/reviews" className={buttonStyles.ghost}>
          <DashboardIcon icon={ArrowLeft01Icon} size={14} aria-hidden="true" />
          All reviews
        </Link>
        <button onClick={() => void loadReview(true)} type="button" disabled={refreshing} className={cn(buttonStyles.secondary, "h-8 px-3 text-[12px]")}>
          <DashboardIcon icon={Refresh01Icon} size={14} className={refreshing ? "animate-spin" : undefined} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error ? <InlineError>Showing your last loaded review. Refresh failed: {error}</InlineError> : null}

      <section className="om-rise flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={review.status} />
            <span className="text-[12px] text-[#8a8a85]">{formatRelativeTime(review.createdAt)}</span>
          </div>
          <h1 className="mt-3 truncate font-pixel text-[28px] font-semibold leading-tight tracking-[-0.045em] sm:text-[36px]">
            <span className="text-[#a3a39e]">{review.repository.owner}/</span>
            {review.repository.name}
            <span className="ml-3 font-mono text-[0.6em] font-normal tracking-normal text-[#a3a39e]">#{review.prNumber}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#6b6b67]">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px]">
              <DashboardIcon icon={HashIcon} size={13} aria-hidden="true" />
              {review.headSha ? review.headSha.slice(0, 8) : "unknown"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DashboardIcon icon={GitBranchIcon} size={13} aria-hidden="true" />
              <span className="font-mono text-[11.5px]">{review.baseBranch}</span>
            </span>
            <span>Started {formatDateTime(review.createdAt)}</span>
          </div>
        </div>
        <a href={githubPullRequestUrl(review.repository.fullName, review.prNumber)} target="_blank" rel="noreferrer" className={buttonStyles.primary}>
          Open on GitHub
          <DashboardIcon icon={ExternalLinkIcon} size={14} aria-hidden="true" />
        </a>
      </section>

      {activeReview ? (
        <div className="om-rise flex items-center gap-3 rounded-2xl border border-[#d6e2fa] bg-[#f5f8ff] px-4 py-3 text-[13px] text-[#2154b8]">
          <DotmSquare3 size={18} dotSize={3} color="#2764d8" />
          <p>OpenMerge is reviewing this pull request. This page refreshes every five seconds.</p>
        </div>
      ) : null}

      {review.status === "FAILED" ? (
        <InlineError>
          <p className="font-medium">This review needs attention.</p>
          <p className="mt-1 leading-5">{review.errorMessage ?? "The review worker could not finish this session. Check the worker logs, then push to the pull request to trigger a new review."}</p>
        </InlineError>
      ) : null}

      <section className="om-rise grid grid-cols-2 overflow-hidden rounded-2xl border border-[#ebebe8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:grid-cols-4">
        {[
          { label: "Findings", value: review.totalComments.toString() },
          { label: "Files reviewed", value: review.filesReviewed.toString() },
          { label: "Turnaround", value: formatDuration(review.startedAt ?? review.createdAt, review.completedAt) },
          { label: "Highest severity", value: highestSeverity ? severityMeta[highestSeverity].label : "None", dot: highestSeverity ? severityMeta[highestSeverity].dot : null },
        ].map((stat, index) => (
          <div key={stat.label} className={cn("px-5 py-4", index % 2 === 1 && "border-l border-[#f0f0ee]", index >= 2 && "border-t border-[#f0f0ee] lg:border-t-0", index === 2 && "lg:border-l")}>
            <p className="text-[12px] text-[#8a8a85]">{stat.label}</p>
            <p className="mt-2 flex items-center gap-2 font-pixel text-[24px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
              {"dot" in stat && stat.dot ? <span className={cn("size-2.5 rounded-full", stat.dot)} aria-hidden="true" /> : null}
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <Panel title="Summary" description="Posted to the pull request" className="om-rise" bodyClassName="px-5 pb-5">
          <div className="whitespace-pre-wrap rounded-xl bg-[#fafaf9] px-4 py-3.5 text-[13px] leading-6 text-[#3f3f3c]">
            {review.summary ?? (activeReview ? "OpenMerge is preparing the summary." : "No summary was recorded for this session.")}
          </div>
        </Panel>

        <Panel title="Severity" description={comments.length ? "Select a level to filter findings" : "No findings recorded"} className="om-rise" bodyClassName="px-5 pb-5">
          {comments.length ? (
            <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
              {severityOrder.map((severity) => {
                const count = severityCounts.get(severity) ?? 0;
                return count ? <div key={severity} className={cn("h-full first:rounded-l-full last:rounded-r-full", severityMeta[severity].bar)} style={{ flexGrow: count }} /> : null;
              })}
            </div>
          ) : (
            <div className="h-2.5 rounded-full bg-[#f0f0ee]" aria-hidden="true" />
          )}
          <ul className="mt-4 space-y-0.5">
            {severityOrder.map((severity) => {
              const count = severityCounts.get(severity) ?? 0;
              const selected = severityFilter === severity;
              return (
                <li key={severity}>
                  <button
                    type="button"
                    disabled={!count}
                    aria-pressed={selected}
                    onClick={() => setSeverityFilter(selected ? null : severity)}
                    className={cn(
                      "flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-[13px] transition-colors disabled:cursor-default disabled:opacity-45",
                      selected ? "bg-[#f1f1ef] font-medium" : "enabled:hover:bg-[#f7f7f5]"
                    )}
                  >
                    <span className={cn("size-2 rounded-full", severityMeta[severity].dot)} aria-hidden="true" />
                    <span className="flex-1 text-left text-[#3f3f3c]">{severityMeta[severity].label}</span>
                    <span className="tabular-nums text-[#6b6b67]">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Findings"
        description={severityFilter ? `Showing ${severityMeta[severityFilter].label.toLowerCase()} findings` : "Inline feedback left on the pull request, grouped by file"}
        action={severityFilter ? <button type="button" onClick={() => setSeverityFilter(null)} className={buttonStyles.ghost}>Clear filter</button> : null}
        className="om-rise"
      >
        {commentsByFile.length ? (
          <div className="border-t border-[#f0f0ee]">
            {commentsByFile.map(([filePath, fileComments]) => (
              <div key={filePath} className="border-b border-[#f0f0ee] last:border-b-0">
                <div className="flex items-center gap-2 bg-[#fbfbfa] px-5 py-2.5">
                  <DashboardIcon icon={FileCodeIcon} size={14} className="shrink-0 text-[#8a8a85]" aria-hidden="true" />
                  <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#3f3f3c]">{filePath}</p>
                  <span className="shrink-0 text-[11px] text-[#a3a39e]">{pluralize(fileComments.length, "finding")}</span>
                </div>
                {fileComments.map((comment) => (
                  <article key={comment.id} className="border-t border-[#f4f4f2] px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={comment.severity} />
                      <span className="rounded-md bg-[#f3f3f1] px-2 py-0.5 text-[11px] capitalize text-[#6b6b67]">{comment.category.toLowerCase()}</span>
                      <span className="ml-auto font-mono text-[11px] text-[#a3a39e]">
                        L{comment.startLine && comment.startLine !== comment.line ? `${comment.startLine}–${comment.line}` : comment.line}
                      </span>
                    </div>
                    {comment.title ? <h3 className="mt-3 text-[14px] font-semibold tracking-[-0.01em] text-[#171717]">{comment.title}</h3> : null}
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-[#52524e]">{comment.body}</p>
                    {comment.suggestion ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#e3ede5]">
                        <p className="border-b border-[#e3ede5] bg-[#f4faf5] px-3.5 py-1.5 text-[11px] font-medium text-[#2e6f4b]">Suggested change</p>
                        <pre className="overflow-x-auto bg-[#fbfdfb] px-3.5 py-3 font-mono text-[12px] leading-5 text-[#2f4a3a]">{comment.suggestion}</pre>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="border-t border-[#f0f0ee] px-6 py-14 text-center">
            <p className="text-[13px] font-medium text-[#3f3f3c]">{activeReview ? "Findings will appear when the review completes." : "No inline findings were recorded."}</p>
            <p className="mt-1 text-[12px] text-[#8a8a85]">{activeReview ? "Hang tight — agents are still reading the diff." : review.status === "COMPLETED" ? "Clean pass. Nothing flagged in this pull request." : "Open the pull request on GitHub for the final review comment."}</p>
          </div>
        )}
      </Panel>

      {review.status === "FAILED" ? (
        <p className="flex items-center gap-2 text-[12px] text-[#8a8a85]">
          <DashboardIcon icon={Alert02Icon} size={13} aria-hidden="true" />
          Attempts: {review.attemptCount ?? 1}
          {review.lastErrorCode ? ` · ${review.lastErrorCode}` : null}
        </p>
      ) : null}
    </div>
  );
}
