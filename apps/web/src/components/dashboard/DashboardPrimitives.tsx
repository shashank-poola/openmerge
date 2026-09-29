import type { ReactNode } from "react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { DotmSquare3 } from "@/components/ui/dotm-square-3";
import { GITHUB_SIGN_IN_URL, isAuthError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { reviewStatusMeta, severityMeta } from "@/lib/dashboard";
import type { CommentSeverity, ReviewStatus } from "@/types/dashboard";

export function DashboardIcon({ icon, size = 16, strokeWidth = 1.8, ...props }: HugeiconsIconProps) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} {...props} />;
}

export const buttonStyles = {
  primary:
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#171717] px-3.5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#e4e4e1] bg-white px-3.5 text-[13px] font-medium text-[#2b2b29] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[#d2d2ce] hover:bg-[#fafaf9] disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-[#6b6b67] transition-colors hover:bg-[#f1f1ef] hover:text-[#171717]",
} as const;

export function StatusDot({ status, className }: { status: ReviewStatus; className?: string }) {
  const meta = reviewStatusMeta[status];
  return (
    <span className={cn("relative inline-flex size-2 shrink-0", className)} aria-hidden="true">
      {meta.live ? <span className={cn("om-ping absolute inset-0 rounded-full opacity-60", meta.dot)} /> : null}
      <span className={cn("relative size-2 rounded-full", meta.dot)} />
    </span>
  );
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const meta = reviewStatusMeta[status];

  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md border border-[#ebebe8] bg-white px-2 text-[11px] font-medium", meta.text)}>
      <StatusDot status={status} className="size-1.5 [&>span]:size-1.5" />
      {meta.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: CommentSeverity }) {
  const meta = severityMeta[severity];

  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md border border-[#ebebe8] bg-white px-2 text-[11px] font-medium", meta.text)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="om-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="font-pixel text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-[#171717] sm:text-[36px]">{title}</h1>
        {description ? <p className="mt-2.5 max-w-xl text-[14px] leading-6 text-[#6b6b67]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </section>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-[#ebebe8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]", className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#171717]">{title}</h2>
            {description ? <p className="mt-0.5 text-[12px] text-[#8a8a85]">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[#f1d6d3] bg-[#fdf6f5] px-4 py-3 text-[13px] text-[#9f3a31]">
      <DashboardIcon icon={Alert02Icon} size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("om-shimmer rounded-lg", className)} />;
}

export function DashboardLoading({ label = "Loading your workspace" }: { label?: string }) {
  return (
    <div className="space-y-7" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="space-y-3">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-[112px] w-full rounded-2xl" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <div className="space-y-2 rounded-2xl border border-[#ebebe8] bg-white p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[260px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function EmptyPanel({
  title,
  description,
  action,
  tone = "neutral",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <div className="om-rise relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#ebebe8] bg-white px-6 py-14 text-center">
      <div className="om-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" />
      <div className="relative grid size-14 place-items-center rounded-2xl border border-[#ebebe8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
        <DotmSquare3 size={26} dotSize={4} animated={false} color={tone === "error" ? "#d93b3b" : "#2764d8"} pattern="full" />
      </div>
      <h2 className="relative mt-5 text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">{title}</h2>
      <p className="relative mt-1.5 max-w-sm text-[13px] leading-6 text-[#6b6b67]">{description}</p>
      {action ? <div className="relative mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorPanel({
  error,
  title,
  description = "Check that the OpenMerge API is running, then try again.",
  onRetry,
}: {
  error: string;
  title: string;
  description?: string;
  onRetry: () => void;
}) {
  if (isAuthError(error)) {
    return (
      <EmptyPanel
        tone="error"
        title="Your session has expired"
        description="Sign in with GitHub again to reopen your workspace."
        action={
          <a href={GITHUB_SIGN_IN_URL} onClick={() => window.localStorage.removeItem("pr_token")} className={buttonStyles.primary}>
            Sign in with GitHub
          </a>
        }
      />
    );
  }

  return (
    <EmptyPanel
      tone="error"
      title={title}
      description={description}
      action={
        <button onClick={onRetry} type="button" className={buttonStyles.primary}>
          Try again
        </button>
      }
    />
  );
}
