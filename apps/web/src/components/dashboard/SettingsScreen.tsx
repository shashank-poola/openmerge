"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight02Icon, BookOpen01Icon, ExternalLinkIcon, Github01Icon, Logout01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { pluralize } from "@/lib/dashboard";
import { buttonStyles, DashboardIcon, DashboardLoading, ErrorPanel, InlineError, PageHeader, Panel } from "./DashboardPrimitives";
import { useWorkspace } from "./WorkspaceProvider";

export function SettingsScreen() {
  const router = useRouter();
  const { data, user, loading, error, reload } = useWorkspace();

  function signOut() {
    window.localStorage.removeItem("pr_token");
    router.replace("/");
  }

  if (loading && !data) {
    return <DashboardLoading label="Loading workspace settings" />;
  }

  if (error && !data) {
    return <ErrorPanel error={error} title="Settings are unavailable" onRetry={() => void reload()} />;
  }

  const installations = data?.installations ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Your account, GitHub App access, and session." />

      {error ? <InlineError>Showing your last loaded settings. Refresh failed: {error}</InlineError> : null}

      {user ? (
        <Panel className="om-rise" bodyClassName="flex items-center gap-4 p-5">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt="" width={48} height={48} className="size-12 rounded-full" />
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-[#2764d8] text-[16px] font-semibold text-white">{(user.name || user.githubLogin)[0]?.toUpperCase()}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{user.name || user.githubLogin}</p>
            <p className="truncate text-[12.5px] text-[#8a8a85]">
              @{user.githubLogin}
              {user.email ? ` · ${user.email}` : null}
            </p>
          </div>
          <a href={`https://github.com/${user.githubLogin}`} target="_blank" rel="noreferrer" className={buttonStyles.secondary}>
            GitHub profile
            <DashboardIcon icon={ExternalLinkIcon} size={14} aria-hidden="true" />
          </a>
        </Panel>
      ) : null}

      <Panel title="Connected GitHub accounts" description="OpenMerge reviews only repositories granted through a GitHub App installation." className="om-rise">
        {installations.length ? (
          <ul className="border-t border-[#f0f0ee]">
            {installations.map((installation) => (
              <li key={installation.id} className="flex flex-col gap-3 border-b border-[#f4f4f2] px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#171717] text-white">
                    <DashboardIcon icon={Github01Icon} size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium">{installation.githubAccountLogin}</p>
                    <p className="mt-0.5 text-[12px] text-[#8a8a85]">
                      {installation.githubAccountType} account · {pluralize(installation.repositories.length, "active repository", "active repositories")}
                    </p>
                  </div>
                </div>
                <a href="https://github.com/settings/installations" target="_blank" rel="noreferrer" className={buttonStyles.secondary}>
                  Manage on GitHub
                  <DashboardIcon icon={ExternalLinkIcon} size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-[#f0f0ee] px-6 py-10 text-center text-[13px] text-[#8a8a85]">No GitHub App installations are connected yet.</p>
        )}
      </Panel>

      <div className="grid gap-5 sm:grid-cols-2">
        <HelpCard icon={Shield01Icon} title="Repository access" body="Repository selection and permissions live in GitHub. Sync OpenMerge after you change access." href="/dashboard/repositories" cta="Manage repositories" />
        <HelpCard icon={BookOpen01Icon} title="Documentation" body="How installations, webhooks, and automatic reviews fit together." href="/docs" cta="Open the docs" />
      </div>

      <section className="om-rise flex flex-col gap-4 rounded-2xl border border-[#f1d6d3] bg-[#fdf8f7] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#5c2b26]">Sign out of this browser</h2>
          <p className="mt-1 text-[12.5px] leading-5 text-[#8f5b55]">Removes the local session from this device. The GitHub App stays installed.</p>
        </div>
        <button onClick={signOut} type="button" className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-[#ecc9c5] bg-white px-3.5 text-[13px] font-medium text-[#b42f2f] transition-colors hover:bg-[#fdf1f0] sm:self-auto">
          <DashboardIcon icon={Logout01Icon} size={14} aria-hidden="true" />
          Sign out
        </button>
      </section>
    </div>
  );
}

function HelpCard({ icon, title, body, href, cta }: { icon: typeof Shield01Icon; title: string; body: string; href: string; cta: string }) {
  return (
    <Link href={href} className="om-rise group rounded-2xl border border-[#ebebe8] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-[#dcdcd8]">
      <span className="grid size-9 place-items-center rounded-xl border border-[#ebebe8] text-[#3f3f3c]">
        <DashboardIcon icon={icon} size={17} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-[14px] font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mt-1.5 text-[12.5px] leading-5 text-[#6b6b67]">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#171717]">
        {cta}
        <DashboardIcon icon={ArrowRight02Icon} size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
