"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  InboxIcon,
  FilterIcon,
  WorkflowSquare01Icon,
  GitPullRequestIcon,
  SourceCodeIcon,
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  ChevronDownIcon,
  CheckmarkCircle01Icon,
  BellIcon,
} from "@hugeicons/core-free-icons";
import { demoRepos, demoReviews } from "@/src/lib/demo-data";

const railItems = [
  { icon: DashboardSquare01Icon, label: "Dashboard", href: "/dashboard" },
  { icon: InboxIcon, label: "Inbox", href: "/dashboard", active: true },
  { icon: GitPullRequestIcon, label: "Pull Requests", href: "#" },
  { icon: WorkflowSquare01Icon, label: "Workflows", href: "#" },
  { icon: SourceCodeIcon, label: "Code", href: "#" },
  { icon: BellIcon, label: "Notifications", href: "#" },
];

const sections = [
  { label: "Needs your review", count: 1 },
  { label: "Returned to you", count: 1 },
  { label: "Approved", count: 1 },
  { label: "Waiting for reviewers", count: 0 },
  { label: "Drafts", count: 0 },
  { label: "Merging and recently merged", count: 0 },
  { label: "Waiting for author", count: 0 },
];

const buckets = [
  { title: "Needs your review", reviews: demoReviews.filter((r) => r.status === "NEEDS_REVIEW") },
  { title: "Returned to you", reviews: demoReviews.filter((r) => r.status === "RETURNED") },
  { title: "Approved", reviews: demoReviews.filter((r) => r.status === "APPROVED") },
  { title: "Waiting for reviewers", reviews: [] as typeof demoReviews },
  { title: "Drafts", reviews: [] as typeof demoReviews },
  { title: "Merging and recently merged", reviews: [] as typeof demoReviews },
  { title: "Waiting for author", reviews: [] as typeof demoReviews },
];

const statusColor: Record<string, string> = {
  NEEDS_REVIEW: "text-[#e8c468]",
  RETURNED: "text-[#f28b82]",
  APPROVED: "text-[#81c995]",
};

export function PullRequestInbox() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#131010] font-mono text-white">
      {/* icon rail */}
      <aside className="flex w-[52px] shrink-0 flex-col items-center border-r border-white/8 py-3 bg-[#0e0c0c]">
        <Link
          href="/"
          className="mb-5 flex h-8 items-center justify-center text-[11px] font-bold text-white select-none"
          aria-label="PullRabbit home"
        >
          pr
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1">
          {railItems.map(({ icon, label, href, active }) => (
            <Link
              key={label}
              href={href}
              title={label}
              className={`grid h-10 w-10 place-items-center transition-colors ${
                active ? "text-white" : "text-[#444] hover:text-[#888]"
              }`}
            >
              <HugeiconsIcon icon={icon} size={18} strokeWidth={active ? 2 : 1.5} />
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-white/8 pt-4">
          <Link href="#" title="Search" className="text-[#444] hover:text-white">
            <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.5} />
          </Link>
          <Link href="#" title="Settings" className="text-[#444] hover:text-white">
            <HugeiconsIcon icon={Settings01Icon} size={18} strokeWidth={1.5} />
          </Link>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white">
            S
          </span>
        </div>
      </aside>

      {/* sections sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-white/8 px-4 py-5 bg-[#0f0d0d]">
        <h1 className="mb-5 text-[14px] font-bold text-white tracking-tight">Inbox</h1>
        <nav className="space-y-0.5 text-[12px]">
          {sections.map((section, i) => (
            <button
              key={section.label}
              type="button"
              className={`flex h-8 w-full items-center justify-between px-2 text-left transition-colors ${
                i === 0 ? "text-white" : "text-[#555] hover:text-[#999]"
              }`}
            >
              <span>{section.label}</span>
              {section.count > 0 && (
                <span className="text-[10px] text-[#444]">{section.count}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="mt-3 flex h-8 w-full items-center gap-2 border-t border-white/8 px-2 pt-3 text-[11px] text-[#444] hover:text-white"
        >
          + Add section
        </button>
      </aside>

      {/* main content */}
      <section className="flex min-w-0 flex-1 flex-col px-6 py-5">
        {/* toolbar */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#444]">
            <HugeiconsIcon icon={FilterIcon} size={14} strokeWidth={1.5} />
            <span>Filter</span>
          </div>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 border border-white/8 px-3 text-[11px] text-[#555] hover:text-white"
          >
            <HugeiconsIcon icon={FilterIcon} size={13} strokeWidth={1.5} />
            {demoRepos.filter((r) => r.autoReviewEnabled).length} repos
            <HugeiconsIcon icon={ChevronDownIcon} size={13} strokeWidth={1.5} />
          </button>
        </div>

        {/* cli onboarding prompt */}
        <div className="mb-5 flex items-center gap-5 border border-white/8 px-5 py-4 text-[12px]">
          <div
            className="h-8 w-8 shrink-0 rounded-full border border-white/10"
            style={{ background: "conic-gradient(#315bdc 60deg, rgba(255,255,255,0.05) 0deg)" }}
          />
          <div className="min-w-0">
            <p className="font-bold text-white">Next step: Install and authenticate the CLI</p>
            <p className="mt-0.5 text-[11px] text-[#555]">
              Required to submit pull requests using the PullRabbit CLI.
            </p>
          </div>
          <span className="shrink-0 border border-white/8 px-2 py-1 text-[10px] text-[#444]">
            2 min
          </span>
          <button
            type="button"
            className="ml-auto shrink-0 bg-white px-4 py-1.5 text-[11px] font-bold text-black hover:bg-[#e8e8e8]"
          >
            Set up CLI →
          </button>
        </div>

        {/* pr buckets */}
        <div className="space-y-3 overflow-y-auto pb-12">
          {buckets.map((bucket) => (
            <Bucket key={bucket.title} title={bucket.title} reviews={bucket.reviews} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Bucket({ title, reviews }: { title: string; reviews: typeof demoReviews }) {
  return (
    <div className="border border-white/8">
      <div className="flex h-9 items-center gap-2 border-b border-white/8 px-4 text-[11px] text-[#444]">
        <HugeiconsIcon icon={ChevronDownIcon} size={13} strokeWidth={1.5} />
        <span className="text-[#666]">{title}</span>
        <span className="ml-1">{reviews.length}</span>
      </div>
      {reviews.length > 0 && (
        <div>
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/dashboard/pr/${review.id}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/8 px-4 py-3 text-[12px] transition-colors hover:bg-white/4 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  #{review.prNumber} Review {review.repository?.name} changes
                </p>
                <p className="mt-0.5 text-[10px] text-[#444]">
                  {review.repository?.fullName} · {review.totalComments} comments · opened recently
                </p>
              </div>
              <span
                className={`text-[10px] font-bold ${statusColor[review.status] ?? "text-[#666]"}`}
              >
                [{review.status.replace("_", " ").toLowerCase()}]
              </span>
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={14}
                strokeWidth={1.5}
                className="text-[#333]"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
