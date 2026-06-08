"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Search, X } from "lucide-react";
import { AppTopbar } from "@/components/app/AppTopbar";
import { DarkGridShell } from "@/components/app/DarkGridShell";
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
    <DarkGridShell>
      <AppTopbar showBack />
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="relative w-full max-w-[600px] border border-white/15 p-8">
          <Corner className="-left-2 -top-3" />
          <Corner className="-right-2 -top-3" />
          <Corner className="-bottom-3 -left-2" />
          <Corner className="-bottom-3 -right-2" />

          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-xs">
              {demoUser.name.slice(0, 1)}
            </span>
            <span className="font-bold">{demoUser.name}</span>
          </div>
          <h1 className="mb-6 text-[20px] font-bold">Select repositories to sync to PullRabbit</h1>

          <label className="mb-3 flex h-12 items-center gap-2 rounded-[8px] border border-[#315bdc] px-4 shadow-[0_0_0_1px_#315bdc]">
            <Search className="h-5 w-5 text-white/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repositories"
              className="w-full bg-transparent text-[20px] outline-none placeholder:text-white/55"
            />
            <span>/</span>
          </label>

          <RepoGroup title="Selected" repos={selectedRepos} selected={selected} onToggle={toggleRepo} />
          <RepoGroup title="Suggested" repos={suggestedRepos} selected={selected} onToggle={toggleRepo} />
          <RepoGroup title="Other" repos={otherRepos} selected={selected} onToggle={toggleRepo} />

          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="mt-5 inline-flex items-center gap-3 px-2 py-2 text-[17px] font-bold text-white/85 hover:text-white"
          >
            <X className="h-5 w-5" />
            Clear all
          </button>

          <Link
            href="/dashboard"
            className="mt-4 flex h-10 w-full items-center justify-center rounded-[7px] bg-[#315bdc] text-[16px] font-bold transition-colors hover:bg-[#3e6af0]"
          >
            Sync repositories
          </Link>
        </div>
      </section>
    </DarkGridShell>
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
    <div className="border-b border-white/10 py-3">
      <p className="mb-2 px-2 text-[15px] font-bold text-white/70">{title}</p>
      <div className="max-h-[145px] overflow-y-auto pr-1">
        {repos.map((repo) => {
          const isSelected = selected.has(repo.id);
          return (
            <button
              key={repo.id}
              type="button"
              onClick={() => onToggle(repo.id)}
              className={`flex h-[45px] w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left text-[16px] font-bold transition-colors ${
                isSelected ? "bg-white/8" : "hover:bg-white/5"
              }`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-[4px] ${isSelected ? "bg-[#315bdc]" : "bg-white/10"}`}>
                {isSelected ? <Check className="h-4 w-4" /> : null}
              </span>
              {repo.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return <span className={`absolute text-2xl leading-none text-white ${className}`}>+</span>;
}
