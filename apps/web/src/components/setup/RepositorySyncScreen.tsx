"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, CheckmarkCircle01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppTopbar } from "@/components/app/AppTopbar";
import { demoRepos, demoUser } from "@/src/lib/demo-data";

const initialSelected = new Set(["assignments", "opennote"]);

export function RepositorySyncScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialSelected);

  const filtered = useMemo(
    () => demoRepos.filter((repo) => repo.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const selectedRepos = filtered.filter((repo) => selected.has(repo.id));
  const suggestedRepos = filtered.filter((repo) => !selected.has(repo.id)).slice(0, 3);
  const otherRepos = filtered.filter((repo) => !selected.has(repo.id)).slice(3);

  function toggleRepo(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#131010] font-mono text-white">
      <AppTopbar showBack />
      <section className="flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="w-full max-w-[560px] border border-white/8 p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/8 text-[10px]">
              {demoUser.name.slice(0, 1)}
            </span>
            <span className="text-[13px] font-bold text-white">{demoUser.name}</span>
          </div>
          <h1 className="mb-6 text-[16px] font-bold text-white">
            Select repositories to sync to PullRabbit
          </h1>

          <label className="mb-4 flex h-10 items-center gap-2 border border-white/15 px-3">
            <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.5} className="text-[#555]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repositories"
              className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#555]"
            />
            <span className="text-[11px] text-[#444]">/</span>
          </label>

          <RepoGroup title="Selected" repos={selectedRepos} selected={selected} onToggle={toggleRepo} />
          <RepoGroup title="Suggested" repos={suggestedRepos} selected={selected} onToggle={toggleRepo} />
          <RepoGroup title="Other" repos={otherRepos} selected={selected} onToggle={toggleRepo} />

          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="mt-4 inline-flex items-center gap-2 text-[12px] text-[#555] hover:text-white"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
            Clear all
          </button>

          <Link
            href="/dashboard"
            className="mt-4 flex h-10 w-full items-center justify-center bg-white text-[13px] font-bold text-black transition-colors hover:bg-[#e8e8e8]"
          >
            Sync repositories
          </Link>
        </div>
      </section>
    </div>
  );
}

type RepoGroupProps = {
  title: string;
  repos: typeof demoRepos;
  selected: Set<string>;
  onToggle: (id: string) => void;
};

function RepoGroup({ title, repos, selected, onToggle }: RepoGroupProps) {
  if (repos.length === 0) return null;

  return (
    <div className="border-b border-white/8 py-3">
      <p className="mb-2 px-1 text-[11px] font-bold text-[#444]">{title}</p>
      <div className="max-h-[145px] overflow-y-auto">
        {repos.map((repo) => {
          const isSelected = selected.has(repo.id);
          return (
            <button
              key={repo.id}
              type="button"
              onClick={() => onToggle(repo.id)}
              className={`flex h-10 w-full items-center gap-3 px-2 text-left text-[13px] font-bold transition-colors ${
                isSelected ? "text-white" : "text-[#777] hover:text-white"
              }`}
            >
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center border ${
                  isSelected ? "border-white bg-white" : "border-white/20 bg-transparent"
                }`}
              >
                {isSelected ? (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-black" strokeWidth={2} />
                ) : null}
              </span>
              {repo.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
