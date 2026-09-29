import type {
  CommentSeverity,
  DashboardRepository,
  DashboardResponse,
  RecentReview,
  ReviewStatus,
} from "@/types/dashboard";

export const GITHUB_INSTALL_URL = "https://github.com/apps/openmerge-app/installations/select_target";

export const reviewStatusMeta: Record<ReviewStatus, { label: string; dot: string; text: string; live: boolean }> = {
  QUEUED: { label: "Queued", dot: "bg-[#d19a1c]", text: "text-[#8a6410]", live: true },
  RUNNING: { label: "Reviewing", dot: "bg-[#2764d8]", text: "text-[#2154b8]", live: true },
  RETRYING: { label: "Retrying", dot: "bg-[#d19a1c]", text: "text-[#8a6410]", live: true },
  COMPLETED: { label: "Completed", dot: "bg-[#1f9d55]", text: "text-[#17784a]", live: false },
  FAILED: { label: "Needs attention", dot: "bg-[#d93b3b]", text: "text-[#b42f2f]", live: false },
};

export const severityOrder: CommentSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export const severityMeta: Record<CommentSeverity, { label: string; dot: string; bar: string; text: string }> = {
  CRITICAL: { label: "Critical", dot: "bg-[#c8322b]", bar: "bg-[#c8322b]", text: "text-[#a8261f]" },
  HIGH: { label: "High", dot: "bg-[#e0782a]", bar: "bg-[#e0782a]", text: "text-[#a8541a]" },
  MEDIUM: { label: "Medium", dot: "bg-[#d9a61c]", bar: "bg-[#d9a61c]", text: "text-[#85650f]" },
  LOW: { label: "Low", dot: "bg-[#3f8f63]", bar: "bg-[#3f8f63]", text: "text-[#2e6f4b]" },
  INFO: { label: "Info", dot: "bg-[#9a9a94]", bar: "bg-[#c4c4bf]", text: "text-[#66665f]" },
};

export function isLiveStatus(status: ReviewStatus) {
  return reviewStatusMeta[status].live;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function firstName(name: string | null | undefined, fallback: string) {
  const first = name?.trim().split(/\s+/)[0];
  return first || fallback;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export type WorkspaceReview = { review: RecentReview; repository: DashboardRepository };

export type ActivityDay = { date: Date; key: string; reviews: number; findings: number };

const DAY_MS = 86_400_000;

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Derives overview metrics from the dashboard payload. The API returns the latest
 * five sessions per repository, so every figure here describes recent activity,
 * not all-time totals.
 */
export function summarizeWorkspace(data: DashboardResponse | null, activityDays = 14) {
  const installations = data?.installations ?? [];
  const repositories = installations.flatMap((installation) => installation.repositories);
  const reviews: WorkspaceReview[] = repositories
    .flatMap((repository) => repository.recentReviews.map((review) => ({ review, repository })))
    .sort((left, right) => new Date(right.review.createdAt).getTime() - new Date(left.review.createdAt).getTime());

  const live = reviews.filter(({ review }) => isLiveStatus(review.status));
  const completed = reviews.filter(({ review }) => review.status === "COMPLETED");
  const failed = reviews.filter(({ review }) => review.status === "FAILED");
  const findings = completed.reduce((total, { review }) => total + review.totalComments, 0);

  const turnarounds = completed
    .map(({ review }) => (review.completedAt ? new Date(review.completedAt).getTime() - new Date(review.createdAt).getTime() : NaN))
    .filter((value) => Number.isFinite(value) && value >= 0);
  const avgTurnaroundMs = turnarounds.length ? turnarounds.reduce((sum, value) => sum + value, 0) / turnarounds.length : null;

  const enabledRepositories = repositories.filter((repository) => repository.autoReviewEnabled).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activity: ActivityDay[] = Array.from({ length: activityDays }, (_, index) => {
    const date = new Date(today.getTime() - (activityDays - 1 - index) * DAY_MS);
    return { date, key: dayKey(date), reviews: 0, findings: 0 };
  });
  const activityByKey = new Map(activity.map((day) => [day.key, day]));
  for (const { review } of reviews) {
    const day = activityByKey.get(dayKey(new Date(review.createdAt)));
    if (!day) continue;
    day.reviews += 1;
    day.findings += review.totalComments;
  }

  const topRepositories = repositories
    .map((repository) => ({
      repository,
      reviews: repository.recentReviews.length,
      findings: repository.recentReviews.reduce((total, review) => total + review.totalComments, 0),
      lastReviewAt: repository.recentReviews[0]?.createdAt ?? null,
    }))
    .filter((entry) => entry.reviews > 0)
    .sort((left, right) => right.reviews - left.reviews || (right.lastReviewAt ?? "").localeCompare(left.lastReviewAt ?? ""))
    .slice(0, 5);

  return {
    installations,
    repositories,
    reviews,
    live,
    completed,
    failed,
    findings,
    avgTurnaroundMs,
    enabledRepositories,
    activity,
    activityTotal: activity.reduce((total, day) => total + day.reviews, 0),
    topRepositories,
  };
}

export type WorkspaceSummary = ReturnType<typeof summarizeWorkspace>;

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "Not finished";

  const milliseconds = new Date(value).getTime() - Date.now();
  const seconds = Math.round(milliseconds / 1_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  if (Math.abs(seconds) < 3_600) return formatter.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86_400) return formatter.format(Math.round(seconds / 3_600), "hour");
  return formatter.format(Math.round(seconds / 86_400), "day");
}

export function formatShortRelative(value: string | null | undefined) {
  if (!value) return "—";

  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1_000));
  if (seconds < 60) return "now";
  if (seconds < 3_600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.round(seconds / 3_600)}h`;
  if (seconds < 86_400 * 30) return `${Math.round(seconds / 86_400)}d`;
  return `${Math.round(seconds / (86_400 * 30))}mo`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatMilliseconds(milliseconds: number | null) {
  if (milliseconds === null || milliseconds < 0) return "—";

  const seconds = Math.round(milliseconds / 1_000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainder = seconds % 60;
    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatDuration(startedAt: string | null | undefined, completedAt: string | null | undefined) {
  if (!startedAt || !completedAt) return "—";
  return formatMilliseconds(new Date(completedAt).getTime() - new Date(startedAt).getTime());
}

export function githubPullRequestUrl(repository: string, prNumber: number) {
  return `https://github.com/${repository}/pull/${prNumber}`;
}
