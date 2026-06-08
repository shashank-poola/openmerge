"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Code2,
  Filter,
  GitPullRequest,
  Inbox,
  LayoutDashboard,
  ListFilter,
  Search,
  Settings,
  SlidersHorizontal,
  Terminal,
  Workflow,
} from "lucide-react";
import { PullRabbitMark } from "@/components/landing/brand/PullRabbitMark";
import { demoRepos, demoReviews } from "@/src/lib/demo-data";

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
  {
    title: "Needs your review",
    reviews: demoReviews.filter((review) => review.status === "NEEDS_REVIEW"),
  },
  {
    title: "Returned to you",
    reviews: demoReviews.filter((review) => review.status === "RETURNED"),
  },
  {
    title: "Approved",
    reviews: demoReviews.filter((review) => review.status === "APPROVED"),
  },
  { title: "Waiting for reviewers", reviews: [] },
  { title: "Drafts", reviews: [] },
  { title: "Merging and recently merged", reviews: [] },
  { title: "Waiting for author", reviews: [] },
];

const railItems = [LayoutDashboard, Inbox, Filter, Workflow, GitPullRequest, Code2, Bell, Search];

export function PullRequestInbox() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#f7f7f8] font-sans text-[#17181c]">
      <aside className="flex w-[60px] shrink-0 flex-col items-center border-r border-[#e2e3e7] bg-[#f0f1f5] py-3">
        <Link href="/" className="mb-5 grid h-9 w-9 place-items-center rounded-[8px] text-[#20232a]">
          <PullRabbitMark />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {railItems.map((Icon, index) => (
            <button
              key={index}
              className={`grid h-10 w-10 place-items-center rounded-[6px] text-[#4d5058] transition-colors hover:bg-[#dfe1e8] ${
                index === 1 ? "bg-[#d9dbe4]" : ""
              }`}
              type="button"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-[#d8dae1] pt-4">
          <CircleHelp className="h-5 w-5 text-[#4d5058]" />
          <Settings className="h-5 w-5 text-[#4d5058]" />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#17181c] text-xs text-white">S</span>
        </div>
      </aside>

      <aside className="w-[375px] shrink-0 px-5 py-5">
        <div className="mb-7 flex items-center gap-3 text-[22px]">
          <button className="grid h-10 w-10 place-items-center rounded-[7px] border border-[#d4d6df] bg-white">
            <LayoutDashboard className="h-5 w-5" />
          </button>
          <h1>Inbox</h1>
        </div>
        <nav className="space-y-1 text-[19px]">
          {sections.map((section, index) => (
            <button
              key={section.label}
              type="button"
              className={`flex h-11 w-full items-center justify-between rounded-[6px] px-3 transition-colors hover:bg-[#ececf0] ${
                index === 0 ? "bg-[#ebecef]" : ""
              }`}
            >
              <span>{section.label}</span>
              <span className="text-[#566078]">{section.count}</span>
            </button>
          ))}
        </nav>
        <button className="mt-5 flex h-11 w-full items-center gap-3 border-t border-[#dcdee6] px-3 pt-4 text-[18px] text-[#4b5161]">
          + Add section
        </button>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col px-5 py-3">
        <div className="mb-5 flex justify-end">
          <button className="inline-flex h-10 items-center gap-3 rounded-[7px] border border-[#d8dae2] bg-white px-4 text-[18px]">
            <ListFilter className="h-5 w-5" />
            {demoRepos.filter((repo) => repo.autoReviewEnabled).length} repos selected
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex min-h-[92px] items-center gap-5 rounded-[18px] border border-[#c7d4f7] bg-[#eaf0ff] px-6">
          <div className="h-14 w-14 rounded-full border-[5px] border-[#b8c0d5] border-t-[#315bdc]" />
          <div>
            <h2 className="text-[22px]">Next step: Install and authenticate the CLI</h2>
            <p className="text-[18px] text-[#4d4053]">This is required to submit pull requests using the PullRabbit CLI.</p>
          </div>
          <span className="rounded-[8px] border border-[#d4d7df] bg-white px-3 py-2 text-[15px]">2 minutes</span>
          <button className="ml-auto inline-flex h-10 items-center gap-2 rounded-[7px] bg-[#315bdc] px-4 font-bold text-white">
            <Terminal className="h-4 w-4" />
            Set up CLI
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto pb-12">
          {buckets.map((bucket) => (
            <Bucket key={bucket.title} title={bucket.title} reviews={bucket.reviews} />
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-0 left-[435px] right-0 h-36 bg-gradient-to-t from-[#f7f7f8] to-transparent" />
      </section>
    </main>
  );
}

function Bucket({ title, reviews }: { title: string; reviews: typeof demoReviews }) {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#e3e4e9] bg-white">
      <div className="flex h-12 items-center gap-3 px-5 text-[19px]">
        <ChevronDown className="h-5 w-5 text-[#555c6c]" />
        <span>{title}</span>
        <span className="text-[#566078]">{reviews.length}</span>
        <div className="ml-auto flex items-center gap-4 text-[#596070]">
          <ListFilter className="h-5 w-5" />
          <SlidersHorizontal className="h-5 w-5" />
        </div>
      </div>
      {reviews.length > 0 ? (
        <div className="border-t border-[#ececf1]">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/dashboard/pr/${review.id}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f7f8fb]"
            >
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold">
                  #{review.prNumber} Review {review.repository?.name} changes
                </p>
                <p className="mt-1 text-[14px] text-[#687083]">
                  {review.repository?.fullName} · {review.totalComments} agent comments · opened recently
                </p>
              </div>
              <span className="rounded-[999px] bg-[#eef2ff] px-3 py-1 text-sm font-bold text-[#315bdc]">
                {review.status.replace("_", " ").toLowerCase()}
              </span>
              <GitPullRequest className="h-5 w-5 text-[#596070]" />
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
