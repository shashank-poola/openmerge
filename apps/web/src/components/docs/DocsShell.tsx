"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowUpRight01Icon, Cancel01Icon, Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { docGroups, GITHUB_REPO_URL } from "./docs-nav";
import { GithubMark } from "@/components/ui/github-mark";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function subscribeNoop() {
  return () => {};
}

function hasSession() {
  try {
    return Boolean(window.localStorage.getItem("pr_token"));
  } catch {
    return false;
  }
}

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Remember the page the drawer was opened on, so navigating closes it.
  const [drawerOpenOn, setDrawerOpenOn] = useState<string | null>(null);
  const drawerOpen = drawerOpenOn === pathname;
  const signedIn = useSyncExternalStore(subscribeNoop, hasSession, () => false);

  return (
    <div className="min-h-screen bg-white text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-[#ececea] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <button type="button" onClick={() => setDrawerOpenOn(pathname)} aria-label="Open documentation menu" className="grid size-8 place-items-center rounded-lg text-[#6b6b67] hover:bg-[#f1f1ef] lg:hidden">
            <HugeiconsIcon icon={Menu01Icon} size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <Link href="/" className="flex items-center gap-2.5" aria-label="OpenMerge home">
            <Image src="/companies/openmerge.png" alt="" width={28} height={28} className="size-7 rounded-[8px] object-cover" priority />
            <span className="font-pixel text-[16px] font-semibold tracking-[-0.04em]">OpenMerge</span>
          </Link>
          <span className="hidden rounded-md border border-[#ebebe8] px-1.5 py-0.5 text-[11.5px] font-medium text-[#6b6b67] sm:inline">Docs</span>

          <div className="ml-auto flex items-center gap-2">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" aria-label="OpenMerge on GitHub" className="group hidden size-8 sm:grid place-items-center rounded-lg text-[#52524e] transition-colors hover:bg-[#f1f1ef] hover:text-[#171717]">
              <GithubMark size={18} className="opacity-80 transition-opacity group-hover:opacity-100" />
            </a>
            {signedIn ? (
              <Link href="/dashboard" className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#171717] px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2b2b2b]">
                Open dashboard
              </Link>
            ) : (
              <a href={`${API_BASE}/api/v1/auth/github`} className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#171717] px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2b2b2b]">
                Get started
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={1.8} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[264px] shrink-0 border-r border-[#ececea] bg-[#fbfbfa] lg:block">
          <DocsNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close documentation menu" onClick={() => setDrawerOpenOn(null)} className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <aside className="om-rise absolute inset-y-0 left-0 w-[284px] border-r border-[#ececea] bg-[#fbfbfa] shadow-2xl">
            <button type="button" onClick={() => setDrawerOpenOn(null)} aria-label="Close documentation menu" className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-[#6b6b67] hover:bg-[#efefed]">
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <DocsNav />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function DocsNav() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const groups = docGroups
    .map((group) => ({
      ...group,
      pages: group.pages.filter((page) => !term || page.title.toLowerCase().includes(term) || page.description.toLowerCase().includes(term)),
    }))
    .filter((group) => group.pages.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-3 pt-5">
        <label className="relative block">
          <span className="sr-only">Search documentation</span>
          <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a39e]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search docs"
            className="h-9 w-full rounded-lg border border-[#e6e6e3] bg-white pl-9 pr-3 text-[13px] text-[#2b2b29] outline-none transition-colors placeholder:text-[#b3b3ae] focus:border-[#9db8ee]"
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-6 pt-2" aria-label="Documentation">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-2.5 text-[12px] font-medium text-[#8a8a85]">{group.title}</p>
            <ul className="mt-1.5 space-y-0.5">
              {group.pages.map((page) => {
                const active = pathname === page.href;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-lg px-2.5 py-1.5 text-[13.5px] transition-colors",
                        active ? "bg-white font-medium text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#ebebe8]" : "text-[#52524e] hover:bg-[#f1f1ef] hover:text-[#171717]"
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {groups.length === 0 ? <p className="px-2.5 text-[13px] text-[#8a8a85]">No pages match “{query}”.</p> : null}
      </nav>

      <div className="border-t border-[#ececea] px-4 py-4">
        <a href={`${GITHUB_REPO_URL}/issues`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] text-[#52524e] transition-colors hover:bg-[#f1f1ef] hover:text-[#171717]">
          Ask a question on GitHub
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
