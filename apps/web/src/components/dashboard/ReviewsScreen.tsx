"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, Refresh01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { getReviews } from "@/lib/api";
import { formatDateTime, formatDuration, formatShortRelative, githubPullRequestUrl, reviewStatusMeta } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { ReviewStatus, ReviewsResponse } from "@/types/dashboard";
import { buttonStyles, DashboardIcon, DashboardLoading, ErrorPanel, InlineError, PageHeader, StatusDot } from "./DashboardPrimitives";
import { useWorkspace } from "./WorkspaceProvider";

const statusFilters: Array<{ value: "ALL" | ReviewStatus | "LIVE"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "In flight" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Needs attention" },
];

type StatusFilter = (typeof statusFilters)[number]["value"];

export function ReviewsScreen() {
  const { summary } = useWorkspace();
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [repositoryId, setRepositoryId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setReviewsData(await getReviews(page));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load review history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (reviewsData?.reviews ?? []).filter((review) => {
      const matchesStatus =
        status === "ALL" || (status === "LIVE" ? reviewStatusMeta[review.status].live : review.status === status);
      const matchesRepository = repositoryId === "ALL" || review.repository.id === repositoryId;
      const matchesSearch = !term || review.repository.fullName.toLowerCase().includes(term) || `#${review.prNumber}`.includes(term);
      return matchesStatus && matchesRepository && matchesSearch;
    });
  }, [repositoryId, reviewsData, search, status]);

  if (loading && !reviewsData) {
    return <DashboardLoading label="Loading review history" />;
  }

  if (error && !reviewsData) {
    return <ErrorPanel error={error} title="Review history is unavailable" onRetry={() => void load()} />;
  }

  const pagination = reviewsData?.pagination;
  const filtersActive = status !== "ALL" || repositoryId !== "ALL" || search.trim() !== "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description={`${pagination?.total ?? 0} review ${pagination?.total === 1 ? "session" : "sessions"} across your connected repositories, newest first.`}
        actions={
          <button onClick={() => void load(true)} type="button" disabled={refreshing} className={buttonStyles.secondary}>
            <DashboardIcon icon={Refresh01Icon} size={14} className={refreshing ? "animate-spin" : undefined} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      {error ? <InlineError>Showing your last loaded results. Refresh failed: {error}</InlineError> : null}

      <div className="om-rise flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#ebebe8] bg-white p-1" role="tablist" aria-label="Filter by status">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={status === filter.value}
              onClick={() => setStatus(filter.value)}
              className={cn(
                "h-7 shrink-0 rounded-lg px-3 text-[12.5px] transition-colors",
                status === filter.value ? "bg-[#171717] font-medium text-white" : "text-[#6b6b67] hover:bg-[#f4f4f2] hover:text-[#171717]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="lg:w-[220px]">
          <span className="sr-only">Filter by repository</span>
          <select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)} className="h-9 w-full rounded-xl border border-[#ebebe8] bg-white px-3 text-[12.5px] text-[#3f3f3c] outline-none transition-colors focus:border-[#9db8ee]">
            <option value="ALL">All repositories</option>
            {summary.repositories.map((repository) => (
              <option key={repository.id} value={repository.id}>
                {repository.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="relative flex-1">
          <span className="sr-only">Search this page</span>
          <DashboardIcon icon={Search01Icon} size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a39e]" aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search repository or #PR on this page" className="h-9 w-full rounded-xl border border-[#ebebe8] bg-white pl-9 pr-3 text-[12.5px] text-[#3f3f3c] outline-none transition-colors placeholder:text-[#b3b3ae] focus:border-[#9db8ee]" />
        </label>
      </div>

      <section className="om-rise overflow-hidden rounded-2xl border border-[#ebebe8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="hidden grid-cols-[minmax(0,1fr)_140px_90px_70px_100px_90px_36px] items-center gap-4 border-b border-[#f0f0ee] bg-[#fbfbfa] px-5 py-2.5 text-[11px] font-medium text-[#8a8a85] md:grid">
          <span>Pull request</span>
          <span>Status</span>
          <span className="text-right">Findings</span>
          <span className="text-right">Files</span>
          <span className="text-right">Turnaround</span>
          <span className="text-right">Opened</span>
          <span />
        </div>

        {filteredReviews.length ? (
          <ul>
            {filteredReviews.map((review) => {
              const meta = reviewStatusMeta[review.status];
              return (
                <li key={review.id} className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-[#f4f4f2] px-5 py-3.5 transition-colors last:border-b-0 hover:bg-[#fafaf9] md:grid-cols-[minmax(0,1fr)_140px_90px_70px_100px_90px_36px]">
                  <div className="min-w-0">
                    <Link href={`/dashboard/reviews/${review.id}`} className="block truncate text-[13px] after:absolute after:inset-0">
                      <span className="text-[#8a8a85]">{review.repository.owner}/</span>
                      <span className="font-medium text-[#171717]">{review.repository.name}</span>
                      <span className="ml-2 font-mono text-[11.5px] text-[#a3a39e]">#{review.prNumber}</span>
                    </Link>
                    <p className="mt-0.5 truncate text-[12px] text-[#8a8a85]" title={review.errorMessage ?? undefined}>
                      {review.errorMessage ? <span className="text-[#b42f2f]">{review.errorMessage}</span> : <>Base {review.baseBranch} · {formatDateTime(review.createdAt)}</>}
                    </p>
                  </div>
                  <span className={cn("inline-flex items-center gap-2 text-[12.5px]", meta.text)}>
                    <StatusDot status={review.status} />
                    {meta.label}
                  </span>
                  <span className="hidden text-right text-[13px] tabular-nums text-[#171717] md:block">{review.totalComments}</span>
                  <span className="hidden text-right text-[13px] tabular-nums text-[#6b6b67] md:block">{review.filesReviewed}</span>
                  <span className="hidden text-right text-[12.5px] tabular-nums text-[#6b6b67] md:block">{formatDuration(review.startedAt ?? review.createdAt, review.completedAt)}</span>
                  <span className="hidden text-right text-[12.5px] tabular-nums text-[#a3a39e] md:block">{formatShortRelative(review.createdAt)}</span>
                  <a
                    href={githubPullRequestUrl(review.repository.fullName, review.prNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 hidden size-7 place-items-center rounded-md text-[#a3a39e] transition hover:bg-[#efefed] hover:text-[#171717] md:grid md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                    aria-label={`Open pull request ${review.prNumber} on GitHub`}
                  >
                    <DashboardIcon icon={ArrowUpRight01Icon} size={14} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-16 text-center">
            <DashboardIcon icon={Search01Icon} size={20} className="mx-auto text-[#a3a39e]" aria-hidden="true" />
            <p className="mt-3 text-[13px] font-medium text-[#3f3f3c]">{filtersActive ? "No reviews match these filters." : "No reviews yet."}</p>
            {filtersActive ? (
              <button type="button" onClick={() => { setStatus("ALL"); setRepositoryId("ALL"); setSearch(""); }} className={cn(buttonStyles.ghost, "mt-2")}>
                Clear filters
              </button>
            ) : (
              <p className="mt-1 text-[12px] text-[#8a8a85]">Open a pull request in a connected repository to start one.</p>
            )}
          </div>
        )}
      </section>

      {pagination && pagination.pages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] text-[#8a8a85]">
            Page {pagination.page} of {pagination.pages} · filters apply to this page
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className={cn(buttonStyles.secondary, "h-8 px-3 text-[12px]")}>
              <DashboardIcon icon={ArrowLeft01Icon} size={14} aria-hidden="true" />
              Previous
            </button>
            <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className={cn(buttonStyles.secondary, "h-8 px-3 text-[12px]")}>
              Next
              <DashboardIcon icon={ArrowRight01Icon} size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
