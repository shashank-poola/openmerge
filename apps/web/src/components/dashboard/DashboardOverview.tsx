"use client";

import Link from "next/link";
import {
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  GitPullRequestIcon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { DotmSquare3 } from "@/components/ui/dotm-square-3";
import {
  firstName,
  formatMilliseconds,
  formatShortRelative,
  GITHUB_INSTALL_URL,
  githubPullRequestUrl,
  greeting,
  pluralize,
  reviewStatusMeta,
  type ActivityDay,
  type WorkspaceReview,
  type WorkspaceSummary,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { buttonStyles, DashboardIcon, DashboardLoading, EmptyPanel, ErrorPanel, InlineError, Panel, StatusDot } from "./DashboardPrimitives";
import { useWorkspace } from "./WorkspaceProvider";
import { GithubMark } from "@/components/ui/github-mark";

export function DashboardOverview() {
  const { data, summary, user, loading, refreshing, error, reload } = useWorkspace();

  if (loading && !data) {
    return <DashboardLoading />;
  }

  if (error && !data) {
    return <ErrorPanel error={error} title="Your workspace could not be loaded" onRetry={() => void reload()} />;
  }

  const login = user?.githubLogin ?? summary.installations[0]?.githubAccountLogin ?? "there";
  const name = firstName(user?.name, login);

  return (
    <div className="space-y-6">
      <section className="om-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="font-pixel text-[32px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171717] sm:text-[42px]">
            {greeting()}, {name}.
          </h1>
          <p className="mt-2.5 text-[14px] leading-6 text-[#6b6b67]">{headline(summary)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => void reload({ silent: true })} type="button" disabled={refreshing} className={buttonStyles.secondary}>
            <DashboardIcon icon={Refresh01Icon} size={14} className={refreshing ? "animate-spin" : undefined} aria-hidden="true" />
            Refresh
          </button>
          <Link href="/dashboard/reviews" className={buttonStyles.primary}>
            All reviews
            <DashboardIcon icon={ArrowRight02Icon} size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {error ? <InlineError>Showing your last loaded workspace. Refresh failed: {error}</InlineError> : null}

      {summary.installations.length === 0 ? (
        <EmptyPanel
          title="Connect your first repository"
          description="Install the OpenMerge GitHub App, pick repositories, and every new pull request enters the review pipeline automatically."
          action={
            <a href={GITHUB_INSTALL_URL} target="_blank" rel="noreferrer" className={buttonStyles.primary}>
              Install on GitHub
              <DashboardIcon icon={ArrowUpRight01Icon} size={14} aria-hidden="true" />
            </a>
          }
        />
      ) : (
        <>
          <StatsStrip summary={summary} />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]">
            <ActivityPanel activity={summary.activity} total={summary.activityTotal} />
            <PipelineCard summary={summary} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]">
            <RecentReviews reviews={summary.reviews.slice(0, 8)} />
            <TopRepositories summary={summary} />
          </div>
        </>
      )}
    </div>
  );
}

function headline(summary: WorkspaceSummary) {
  if (summary.live.length) {
    return `OpenMerge is reviewing ${pluralize(summary.live.length, "pull request")} right now.`;
  }
  if (summary.activityTotal) {
    return `${pluralize(summary.activityTotal, "review")} in the last two weeks across ${pluralize(summary.repositories.length, "repository", "repositories")}.`;
  }
  return `Watching ${pluralize(summary.repositories.length, "repository", "repositories")}. Open a pull request to start a review.`;
}

function StatsStrip({ summary }: { summary: WorkspaceSummary }) {
  const coverage = summary.repositories.length ? Math.round((summary.enabledRepositories / summary.repositories.length) * 100) : 0;
  const stats = [
    { label: "Reviews delivered", value: summary.completed.length.toString(), hint: summary.failed.length ? `${summary.failed.length} need attention` : "No failures" },
    { label: "Findings posted", value: summary.findings.toString(), hint: summary.completed.length ? `${(summary.findings / summary.completed.length).toFixed(1)} per review` : "Awaiting first review" },
    { label: "Avg. turnaround", value: formatMilliseconds(summary.avgTurnaroundMs), hint: "PR opened → review posted" },
    { label: "Auto-review coverage", value: `${coverage}%`, hint: `${summary.enabledRepositories} of ${summary.repositories.length} repositories`, meter: coverage },
  ];

  return (
    <section className="om-rise grid grid-cols-2 overflow-hidden rounded-2xl border border-[#ebebe8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:grid-cols-4" aria-label="Recent activity metrics">
      {stats.map((stat, index) => (
        <div key={stat.label} className={cn("px-5 py-4", index % 2 === 1 && "border-l border-[#f0f0ee]", index >= 2 && "border-t border-[#f0f0ee] lg:border-t-0", index === 2 && "lg:border-l")}>
          <p className="text-[12px] text-[#8a8a85]">{stat.label}</p>
          <p className="mt-2 font-pixel text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#171717] tabular-nums">{stat.value}</p>
          {"meter" in stat && stat.meter !== undefined ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#f0f0ee]">
                <div className="h-full rounded-full bg-[#1f9d55] transition-[width] duration-700" style={{ width: `${stat.meter}%` }} />
              </div>
              <span className="shrink-0 text-[11px] text-[#8a8a85]">{stat.hint}</span>
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-[#8a8a85]">{stat.hint}</p>
          )}
        </div>
      ))}
    </section>
  );
}

const dayFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });

function ActivityPanel({ activity, total }: { activity: ActivityDay[]; total: number }) {
  const max = Math.max(1, ...activity.map((day) => day.reviews));

  return (
    <Panel
      title="Review activity"
      description="Reviews started per day · last 14 days"
      action={<span className="font-pixel text-[20px] font-semibold tracking-[-0.03em] tabular-nums">{total}</span>}
      className="om-rise"
      bodyClassName="px-5 pb-4"
    >
      {total === 0 ? (
        <div className="grid h-[168px] place-items-center rounded-xl border border-dashed border-[#e4e4e1] text-center">
          <div>
            <p className="text-[13px] font-medium text-[#3f3f3c]">No reviews in the last two weeks</p>
            <p className="mt-1 text-[12px] text-[#8a8a85]">Open or update a pull request in a connected repository.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-[168px]">
            <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-[#ececea]" aria-hidden="true">
              <span className="absolute -top-2 right-0 bg-white pl-1.5 text-[10px] tabular-nums text-[#a3a39e]">{max}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-[#e4e4e1]" aria-hidden="true" />
            <ol className="relative flex h-full items-end gap-[3px] sm:gap-1.5">
              {activity.map((day, index) => {
                const isToday = index === activity.length - 1;
                const height = day.reviews ? Math.max(6, (day.reviews / max) * 100) : 0;
                return (
                  <li key={day.key} className="group relative flex h-full flex-1 items-end justify-center outline-none" tabIndex={0} aria-label={`${weekdayFormatter.format(day.date)}: ${pluralize(day.reviews, "review")}, ${pluralize(day.findings, "finding")}`}>
                    <div
                      className={cn(
                        "w-full max-w-[18px] rounded-t-[4px] transition-[height,background-color] duration-500",
                        day.reviews ? (isToday ? "bg-[#2764d8]" : "bg-[#3a3a38] group-hover:bg-[#171717] group-focus-visible:bg-[#171717]") : "h-[2px] bg-[#e4e4e1]"
                      )}
                      style={day.reviews ? { height: `${height}%` } : undefined}
                    />
                    <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 hidden w-max -translate-x-1/2 rounded-lg bg-[#171717] px-2.5 py-1.5 text-[11px] leading-4 text-white shadow-lg group-hover:block group-focus-visible:block">
                      <p className="font-medium">{weekdayFormatter.format(day.date)}</p>
                      <p className="text-white/70">
                        {pluralize(day.reviews, "review")} · {pluralize(day.findings, "finding")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[#a3a39e]" aria-hidden="true">
            <span>{dayFormatter.format(activity[0].date)}</span>
            <span>{dayFormatter.format(activity[Math.floor(activity.length / 2)].date)}</span>
            <span>Today</span>
          </div>
          <table className="sr-only">
            <caption>Reviews started per day, last 14 days</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Reviews</th>
                <th scope="col">Findings</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((day) => (
                <tr key={day.key}>
                  <td>{weekdayFormatter.format(day.date)}</td>
                  <td>{day.reviews}</td>
                  <td>{day.findings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Panel>
  );
}

const pipelineStages = ["Pull request opened", "Context gathered in parallel", "Code, security & performance agents review", "Inline comments posted on GitHub"];

function PipelineCard({ summary }: { summary: WorkspaceSummary }) {
  const live = summary.live;
  const installation = summary.installations[0];

  return (
    <Panel
      title="Review pipeline"
      description={live.length ? `${pluralize(live.length, "review")} in flight` : "Ready for the next pull request"}
      action={
        <span className="grid size-9 place-items-center rounded-xl border border-[#ebebe8] bg-[#fafaf9]">
          <DotmSquare3 size={18} dotSize={3} animated={live.length > 0} color={live.length ? "#2764d8" : "#1f9d55"} />
        </span>
      }
      className="om-rise flex flex-col"
      bodyClassName="flex flex-1 flex-col px-5 pb-4"
    >
      {live.length ? (
        <ul className="mb-4 space-y-1.5">
          {live.slice(0, 3).map(({ review, repository }) => (
            <li key={review.id}>
              <Link href={`/dashboard/reviews/${review.id}`} className="flex items-center gap-3 rounded-lg border border-[#ebebe8] px-3 py-2 text-[12.5px] transition-colors hover:bg-[#fafaf9]">
                <StatusDot status={review.status} />
                <span className="min-w-0 flex-1 truncate text-[#171717]">{repository.fullName}</span>
                <span className="font-mono text-[11px] text-[#a3a39e]">#{review.prNumber}</span>
                <span className={cn("text-[11px]", reviewStatusMeta[review.status].text)}>{reviewStatusMeta[review.status].label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <ol className="flex-1 space-y-2.5 text-[12.5px] text-[#6b6b67]">
        {pipelineStages.map((stage, index) => (
          <li key={stage} className="flex items-center gap-3">
            <span className="grid size-5 shrink-0 place-items-center rounded-md border border-[#ebebe8] font-mono text-[10px] text-[#8a8a85]">{index + 1}</span>
            {stage}
          </li>
        ))}
      </ol>

      {installation ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f0f0ee] pt-3.5 text-[12px]">
          <span className="flex min-w-0 items-center gap-2 text-[#6b6b67]">
            <GithubMark size={15} className="opacity-70" />
            <span className="truncate">
              {installation.githubAccountLogin} · {pluralize(summary.repositories.length, "repo")} watched
            </span>
          </span>
          <Link href="/dashboard/repositories" className="shrink-0 font-medium text-[#171717] underline-offset-4 hover:underline">
            Manage
          </Link>
        </div>
      ) : null}
    </Panel>
  );
}

function RecentReviews({ reviews }: { reviews: WorkspaceReview[] }) {
  return (
    <Panel
      title="Recent reviews"
      description="Latest sessions across your repositories"
      action={
        <Link href="/dashboard/reviews" className={buttonStyles.ghost}>
          View all
          <DashboardIcon icon={ArrowRight02Icon} size={13} aria-hidden="true" />
        </Link>
      }
      className="om-rise"
    >
      {reviews.length ? (
        <ul className="border-t border-[#f0f0ee]">
          {reviews.map(({ review, repository }) => (
            <li key={review.id} className="group relative flex items-center gap-3.5 border-b border-[#f4f4f2] px-5 py-3 transition-colors last:border-b-0 hover:bg-[#fafaf9]">
              <StatusDot status={review.status} />
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/reviews/${review.id}`} className="block truncate text-[13px] after:absolute after:inset-0">
                  <span className="text-[#8a8a85]">{repository.owner}/</span>
                  <span className="font-medium text-[#171717]">{repository.name}</span>
                  <span className="ml-2 font-mono text-[11.5px] text-[#a3a39e]">#{review.prNumber}</span>
                </Link>
                <p className="mt-0.5 truncate text-[12px] text-[#8a8a85]">
                  {review.status === "COMPLETED" ? pluralize(review.totalComments, "finding") : reviewStatusMeta[review.status].label}
                  {review.completedAt ? ` · ${formatMilliseconds(new Date(review.completedAt).getTime() - new Date(review.createdAt).getTime())} turnaround` : null}
                </p>
              </div>
              <span className="shrink-0 text-[12px] tabular-nums text-[#a3a39e]">{formatShortRelative(review.createdAt)}</span>
              <a
                href={githubPullRequestUrl(repository.fullName, review.prNumber)}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 grid size-7 shrink-0 place-items-center rounded-md text-[#a3a39e] opacity-100 transition hover:bg-[#efefed] hover:text-[#171717] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                aria-label={`Open pull request ${review.prNumber} on GitHub`}
              >
                <DashboardIcon icon={ArrowUpRight01Icon} size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-t border-[#f0f0ee] px-6 py-12 text-center">
          <DashboardIcon icon={GitPullRequestIcon} size={20} className="mx-auto text-[#a3a39e]" aria-hidden="true" />
          <p className="mt-3 text-[13px] font-medium text-[#3f3f3c]">No reviews have run yet.</p>
          <p className="mt-1 text-[12px] leading-5 text-[#8a8a85]">Open a pull request in a connected repository and OpenMerge will review it.</p>
        </div>
      )}
    </Panel>
  );
}

function TopRepositories({ summary }: { summary: WorkspaceSummary }) {
  const top = summary.topRepositories;
  const max = Math.max(1, ...top.map((entry) => entry.reviews));

  return (
    <Panel title="Most active repositories" description="By recent review volume" className="om-rise" bodyClassName="px-5 pb-5">
      {top.length ? (
        <ul className="space-y-3.5">
          {top.map(({ repository, reviews, findings }) => (
            <li key={repository.id}>
              <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <a href={`https://github.com/${repository.fullName}`} target="_blank" rel="noreferrer" className="min-w-0 truncate font-medium text-[#2b2b29] hover:text-[#2764d8]">
                  {repository.name}
                </a>
                <span className="shrink-0 tabular-nums text-[#8a8a85]">
                  {reviews} <span className="text-[#c4c4bf]">·</span> {pluralize(findings, "finding")}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#f1f1ef]">
                <div className="h-full rounded-full bg-[#3a3a38]" style={{ width: `${(reviews / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-[12px] text-[#8a8a85]">Repository activity appears after the first review.</p>
      )}
      <Link href="/dashboard/repositories" className={cn(buttonStyles.secondary, "mt-5 w-full")}>
        Manage {pluralize(summary.repositories.length, "repository", "repositories")}
      </Link>
    </Panel>
  );
}
