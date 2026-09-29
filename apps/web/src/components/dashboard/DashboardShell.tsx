"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  BookOpen01Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  FolderGitIcon,
  Logout01Icon,
  Menu01Icon,
  PlusSignIcon,
  Settings01Icon,
  SidebarLeftIcon,
  Task01Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { GITHUB_INSTALL_URL, pluralize } from "@/lib/dashboard";
import { buttonStyles, DashboardIcon, StatusDot } from "./DashboardPrimitives";
import { useWorkspace, WorkspaceProvider } from "./WorkspaceProvider";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: DashboardSquare01Icon, exact: true },
  { href: "/dashboard/reviews", label: "Reviews", icon: Task01Icon },
  { href: "/dashboard/repositories", label: "Repositories", icon: FolderGitIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
];

const COLLAPSED_KEY = "openmerge_sidebar_collapsed";
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(listener: () => void) {
  collapsedListeners.add(listener);
  return () => {
    collapsedListeners.delete(listener);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    // Storage can be unavailable (private mode); the expanded sidebar is a fine default.
    return false;
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // Ignore storage failures; the preference just will not persist.
  }
  collapsedListeners.forEach((listener) => listener());
}

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/reviews/")) return ["Reviews", "Review detail"];
  const match = navigation.find(({ href, exact }) => isActive(pathname, href, exact));
  return [match?.label ?? "Overview"];
}

function signOut(router: ReturnType<typeof useRouter>) {
  window.localStorage.removeItem("pr_token");
  router.replace("/");
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!window.localStorage.getItem("pr_token")) {
      router.replace("/");
    }
  }, [router]);

  return (
    <WorkspaceProvider>
      <ShellFrame>{children}</ShellFrame>
    </WorkspaceProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  // The drawer remembers which page it was opened on, so navigating closes it.
  const [mobileOpenOn, setMobileOpenOn] = useState<string | null>(null);
  const mobileOpen = mobileOpenOn === pathname;
  const setMobileOpen = (open: boolean) => setMobileOpenOn(open ? pathname : null);

  const crumbs = pageTitle(pathname);

  return (
    <div className="min-h-screen bg-[#f9f9f8] text-[#171717]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-[#ececea] bg-white transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-[68px]" : "w-[252px]"
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <aside className="om-rise absolute inset-y-0 left-0 w-[272px] border-r border-[#ececea] bg-white shadow-2xl">
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="absolute right-3 top-4 z-10 grid size-8 place-items-center rounded-lg text-[#6b6b67] hover:bg-[#f1f1ef]">
              <DashboardIcon icon={Cancel01Icon} size={16} aria-hidden="true" />
            </button>
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      ) : null}

      <div className={cn("transition-[padding] duration-200 ease-out", collapsed ? "lg:pl-[68px]" : "lg:pl-[252px]")}>
        <header className="sticky top-0 z-20 border-b border-[#ececea] bg-[#f9f9f8]/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="grid size-8 place-items-center rounded-lg text-[#6b6b67] hover:bg-[#efefed] lg:hidden">
                <DashboardIcon icon={Menu01Icon} size={17} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => writeCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-pressed={collapsed} className="hidden size-8 place-items-center rounded-lg text-[#6b6b67] hover:bg-[#efefed] hover:text-[#171717] lg:grid">
                <DashboardIcon icon={SidebarLeftIcon} size={17} aria-hidden="true" />
              </button>
              <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px]">
                {crumbs.map((crumb, index) => (
                  <span key={crumb} className="flex min-w-0 items-center gap-2">
                    {index > 0 ? <span className="text-[#c9c9c4]">/</span> : null}
                    <span className={cn("truncate", index === crumbs.length - 1 ? "font-medium text-[#171717]" : "text-[#8a8a85]")}>{crumb}</span>
                  </span>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <PipelinePill />
              <a href={GITHUB_INSTALL_URL} target="_blank" rel="noreferrer" className={cn(buttonStyles.secondary, "hidden h-8 px-3 text-[12px] sm:inline-flex")}>
                <DashboardIcon icon={PlusSignIcon} size={14} aria-hidden="true" />
                Add repositories
              </a>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

function PipelinePill() {
  const { summary, loading } = useWorkspace();
  if (loading) return null;

  const live = summary.live.length;
  return (
    <span className={cn("hidden h-8 items-center gap-2 rounded-full border px-3 text-[12px] font-medium md:inline-flex", live ? "border-[#d6e2fa] bg-[#f3f7ff] text-[#2154b8]" : "border-[#ebebe8] bg-white text-[#6b6b67]")} role="status">
      {live ? <StatusDot status="RUNNING" /> : <span className="size-2 rounded-full bg-[#1f9d55]" aria-hidden="true" />}
      {live ? `${pluralize(live, "review")} in flight` : "Pipeline ready"}
    </span>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { summary } = useWorkspace();
  const recent = summary.reviews.slice(0, 7);

  return (
    <div className="flex h-full flex-col px-3 pb-3 pt-4">
      <Link href="/dashboard" className={cn("flex h-10 items-center gap-2.5 px-1.5", collapsed && "justify-center px-0")} aria-label="OpenMerge dashboard">
        <Image src="/companies/openmerge.png" alt="" width={30} height={30} className="size-[30px] shrink-0 rounded-[9px] object-cover" priority />
        {!collapsed ? <span className="font-pixel text-[17px] font-semibold tracking-[-0.04em]">OpenMerge</span> : null}
      </Link>

      <nav className="mt-6 space-y-0.5" aria-label="Dashboard navigation">
        {navigation.map(({ href, label, icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13.5px] transition-colors",
                collapsed && "justify-center px-0",
                active ? "bg-[#f1f1ef] font-medium text-[#171717]" : "text-[#52524e] hover:bg-[#f6f6f4] hover:text-[#171717]"
              )}
            >
              <DashboardIcon icon={icon} size={17} strokeWidth={active ? 2 : 1.7} aria-hidden="true" />
              {!collapsed ? label : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="mt-7 min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2.5">
            <p className="text-[12px] font-medium text-[#8a8a85]">Recent reviews</p>
            {recent.length ? (
              <Link href="/dashboard/reviews" className="text-[11px] text-[#a3a39e] hover:text-[#171717]">
                All
              </Link>
            ) : null}
          </div>
          {recent.length ? (
            <ol className="relative mt-2 pl-2.5">
              <span className="absolute bottom-3 left-[13px] top-3 w-px bg-[#e6e6e3]" aria-hidden="true" />
              {recent.map(({ review, repository }) => {
                const href = `/dashboard/reviews/${review.id}`;
                const active = pathname === href;
                return (
                  <li key={review.id}>
                    <Link
                      href={href}
                      className={cn(
                        "group relative flex h-8 items-center gap-3 rounded-lg pr-2 text-[12.5px] transition-colors",
                        active ? "text-[#171717]" : "text-[#6b6b67] hover:text-[#171717]"
                      )}
                    >
                      <span className="relative z-10 grid size-2 place-items-center rounded-full ring-[3px] ring-white">
                        <StatusDot status={review.status} />
                      </span>
                      <span className={cn("min-w-0 flex-1 truncate rounded-md px-1.5 py-1", active ? "bg-[#f1f1ef]" : "group-hover:bg-[#f6f6f4]")}>
                        {repository.name}
                        <span className="ml-1 font-mono text-[11px] text-[#a3a39e]">#{review.prNumber}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-2 px-2.5 text-[12px] leading-5 text-[#a3a39e]">Reviews appear here once a pull request is opened.</p>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <UserMenu collapsed={collapsed} />
    </div>
  );
}

function UserMenu({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { user, summary } = useWorkspace();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const login = user?.githubLogin ?? summary.installations[0]?.githubAccountLogin ?? "";
  const displayName = user?.name || login || "Your account";
  const initial = (displayName[0] ?? "O").toUpperCase();

  return (
    <div ref={containerRef} className="relative mt-3">
      {open ? (
        <div role="menu" className="om-rise absolute bottom-[calc(100%+6px)] left-0 z-50 w-[228px] overflow-hidden rounded-xl border border-[#ebebe8] bg-white p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
          <div className="px-2.5 pb-2 pt-1.5">
            <p className="truncate text-[13px] font-medium text-[#171717]">{displayName}</p>
            {login ? <p className="truncate text-[11px] text-[#8a8a85]">@{login}</p> : null}
          </div>
          <div className="h-px bg-[#f0f0ee]" />
          <Link role="menuitem" href="/dashboard/settings" onClick={() => setOpen(false)} className="mt-1 flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-[#3f3f3c] hover:bg-[#f6f6f4]">
            <DashboardIcon icon={Settings01Icon} size={15} aria-hidden="true" />
            Settings
          </Link>
          <Link role="menuitem" href="/docs" className="flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-[#3f3f3c] hover:bg-[#f6f6f4]">
            <DashboardIcon icon={BookOpen01Icon} size={15} aria-hidden="true" />
            Documentation
          </Link>
          <button role="menuitem" type="button" onClick={() => signOut(router)} className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#b42f2f] hover:bg-[#fdf3f2]">
            <DashboardIcon icon={Logout01Icon} size={15} aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-[#ebebe8] bg-white p-1.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fafaf9]",
          collapsed && "justify-center border-transparent p-1 shadow-none"
        )}
      >
        {user?.avatarUrl ? (
          <Image src={user.avatarUrl} alt="" width={30} height={30} className="size-[30px] shrink-0 rounded-full" />
        ) : (
          <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#2764d8] text-[12px] font-semibold text-white">{initial}</span>
        )}
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium leading-4 text-[#171717]">{displayName}</span>
              <span className="block truncate text-[11px] leading-4 text-[#8a8a85]">{login ? `@${login}` : "GitHub account"}</span>
            </span>
            <DashboardIcon icon={UnfoldMoreIcon} size={14} className="shrink-0 text-[#a3a39e]" aria-hidden="true" />
          </>
        ) : null}
      </button>
    </div>
  );
}
