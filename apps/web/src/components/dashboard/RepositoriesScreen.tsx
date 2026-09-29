"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight01Icon, Github01Icon, GitBranchIcon, LockKeyIcon, PlusSignIcon, Refresh01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { setRepositoryAutoReview, syncInstallation } from "@/lib/api";
import { formatRelativeTime, GITHUB_INSTALL_URL, pluralize } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { buttonStyles, DashboardIcon, DashboardLoading, EmptyPanel, ErrorPanel, InlineError, PageHeader } from "./DashboardPrimitives";
import { useWorkspace } from "./WorkspaceProvider";

type CoverageFilter = "ALL" | "ON" | "PAUSED";

export function RepositoriesScreen() {
  const { data, setData, summary, loading, error, reload } = useWorkspace();
  const [syncingInstallationId, setSyncingInstallationId] = useState<string | null>(null);
  const [updatingRepositoryId, setUpdatingRepositoryId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [coverage, setCoverage] = useState<CoverageFilter>("ALL");

  const installations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.installations ?? []).map((installation) => ({
      installation,
      repositories: installation.repositories.filter((repository) => {
        const matchesSearch = !term || repository.fullName.toLowerCase().includes(term);
        const matchesCoverage = coverage === "ALL" || (coverage === "ON" ? repository.autoReviewEnabled : !repository.autoReviewEnabled);
        return matchesSearch && matchesCoverage;
      }),
    }));
  }, [coverage, data, search]);

  async function toggleAutoReview(repoId: string, enabled: boolean) {
    setUpdatingRepositoryId(repoId);
    setActionError(null);

    try {
      const result = await setRepositoryAutoReview(repoId, enabled);
      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          installations: current.installations.map((installation) => ({
            ...installation,
            repositories: installation.repositories.map((repository) =>
              repository.id === repoId ? { ...repository, ...result.repo, recentReviews: repository.recentReviews } : repository
            ),
          })),
        };
      });
    } catch (updateError) {
      setActionError(updateError instanceof Error ? updateError.message : "Could not update repository settings.");
    } finally {
      setUpdatingRepositoryId(null);
    }
  }

  async function syncRepositories(installationId: string) {
    setSyncingInstallationId(installationId);
    setActionError(null);

    try {
      await syncInstallation(installationId);
      await reload({ silent: true });
    } catch (syncError) {
      setActionError(syncError instanceof Error ? syncError.message : "Could not synchronize repositories from GitHub.");
    } finally {
      setSyncingInstallationId(null);
    }
  }

  if (loading && !data) {
    return <DashboardLoading label="Loading connected repositories" />;
  }

  if (error && !data) {
    return <ErrorPanel error={error} title="Repositories are unavailable" onRetry={() => void reload()} />;
  }

  const paused = summary.repositories.length - summary.enabledRepositories;
  const coverageFilters: Array<{ value: CoverageFilter; label: string; count: number }> = [
    { value: "ALL", label: "All", count: summary.repositories.length },
    { value: "ON", label: "Auto-review on", count: summary.enabledRepositories },
    { value: "PAUSED", label: "Paused", count: paused },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositories"
        description="Choose where OpenMerge reviews automatically. Sync after changing GitHub App access."
        actions={
          <a href={GITHUB_INSTALL_URL} target="_blank" rel="noreferrer" className={buttonStyles.primary}>
            <DashboardIcon icon={PlusSignIcon} size={14} aria-hidden="true" />
            Add repositories
          </a>
        }
      />

      {actionError ? <InlineError>{actionError}</InlineError> : null}
      {error ? <InlineError>Showing your last loaded repositories. Refresh failed: {error}</InlineError> : null}

      {data?.installations.length ? (
        <>
          <div className="om-rise flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search repositories</span>
              <DashboardIcon icon={Search01Icon} size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a39e]" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${pluralize(summary.repositories.length, "repository", "repositories")}`} className="h-9 w-full rounded-xl border border-[#ebebe8] bg-white pl-9 pr-3 text-[12.5px] text-[#3f3f3c] outline-none transition-colors placeholder:text-[#b3b3ae] focus:border-[#9db8ee]" />
            </label>
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#ebebe8] bg-white p-1" role="tablist" aria-label="Filter by auto-review">
              {coverageFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={coverage === filter.value}
                  onClick={() => setCoverage(filter.value)}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[12.5px] transition-colors",
                    coverage === filter.value ? "bg-[#171717] font-medium text-white" : "text-[#6b6b67] hover:bg-[#f4f4f2] hover:text-[#171717]"
                  )}
                >
                  {filter.label}
                  <span className={cn("tabular-nums", coverage === filter.value ? "text-white/60" : "text-[#a3a39e]")}>{filter.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {installations.map(({ installation, repositories }) => (
              <section key={installation.id} className="om-rise overflow-hidden rounded-2xl border border-[#ebebe8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <header className="flex flex-col gap-3 border-b border-[#f0f0ee] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-[#171717] text-white">
                      <DashboardIcon icon={Github01Icon} size={17} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[14px] font-semibold tracking-[-0.01em]">{installation.githubAccountLogin}</h2>
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#ebebe8] px-1.5 py-0.5 text-[10.5px] font-medium capitalize text-[#17784a]">
                          <span className="size-1.5 rounded-full bg-[#1f9d55]" aria-hidden="true" />
                          {installation.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-[#8a8a85]">
                        {installation.githubAccountType} account · {pluralize(installation.repositories.length, "repository", "repositories")}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => void syncRepositories(installation.id)} type="button" disabled={syncingInstallationId === installation.id} className={cn(buttonStyles.secondary, "h-8 self-start px-3 text-[12px] sm:self-auto")}>
                    <DashboardIcon icon={Refresh01Icon} size={14} className={syncingInstallationId === installation.id ? "animate-spin" : undefined} aria-hidden="true" />
                    {syncingInstallationId === installation.id ? "Syncing…" : "Sync from GitHub"}
                  </button>
                </header>

                {repositories.length ? (
                  <ul>
                    {repositories.map((repository) => {
                      const isUpdating = updatingRepositoryId === repository.id;
                      const lastReview = repository.recentReviews[0];
                      return (
                        <li key={repository.id} className="group flex items-center gap-4 border-b border-[#f4f4f2] px-5 py-3 transition-colors last:border-b-0 hover:bg-[#fafaf9]">
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <a href={`https://github.com/${repository.fullName}`} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 truncate text-[13px] hover:text-[#2764d8]">
                                <span className="text-[#8a8a85]">{repository.owner}/</span>
                                <span className="truncate font-medium text-[#171717]">{repository.name}</span>
                                <DashboardIcon icon={ArrowUpRight01Icon} size={12} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-60" aria-hidden="true" />
                              </a>
                              {repository.isPrivate ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#ebebe8] px-1.5 py-0.5 text-[10.5px] text-[#6b6b67]">
                                  <DashboardIcon icon={LockKeyIcon} size={11} aria-hidden="true" />
                                  Private
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-[#8a8a85]">
                              <DashboardIcon icon={GitBranchIcon} size={12} aria-hidden="true" />
                              <span className="font-mono text-[11.5px]">{repository.defaultBranch}</span>
                              <span className="text-[#d4d4cf]">·</span>
                              {lastReview ? `Last review ${formatRelativeTime(lastReview.createdAt)}` : "No reviews yet"}
                            </p>
                          </div>
                          <span className={cn("hidden text-[12px] sm:block", repository.autoReviewEnabled ? "text-[#17784a]" : "text-[#a3a39e]")}>{repository.autoReviewEnabled ? "Auto-review on" : "Paused"}</span>
                          <button
                            onClick={() => void toggleAutoReview(repository.id, !repository.autoReviewEnabled)}
                            disabled={isUpdating}
                            type="button"
                            role="switch"
                            aria-checked={repository.autoReviewEnabled}
                            aria-label={`Automatic review for ${repository.fullName}`}
                            className={cn(
                              "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[3px] transition-colors disabled:cursor-wait disabled:opacity-60",
                              repository.autoReviewEnabled ? "bg-[#171717]" : "bg-[#e0e0dc]"
                            )}
                          >
                            <span className={cn("size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200", repository.autoReviewEnabled ? "translate-x-4" : "translate-x-0", isUpdating && "animate-pulse")} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-[13px] font-medium text-[#3f3f3c]">{installation.repositories.length ? "No repositories match these filters." : "No active repositories in this installation."}</p>
                    <p className="mt-1 text-[12px] text-[#8a8a85]">{installation.repositories.length ? "Try a different search or filter." : "Update repository access in GitHub, then sync this installation."}</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      ) : (
        <EmptyPanel
          title="No repositories are connected"
          description="Install the OpenMerge GitHub App and select the repositories you want reviewed."
          action={
            <a href={GITHUB_INSTALL_URL} target="_blank" rel="noreferrer" className={buttonStyles.primary}>
              Install on GitHub
              <DashboardIcon icon={ArrowUpRight01Icon} size={14} aria-hidden="true" />
            </a>
          }
        />
      )}
    </div>
  );
}
