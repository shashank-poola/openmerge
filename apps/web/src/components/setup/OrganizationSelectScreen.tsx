"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AppTopbar } from "@/components/app/AppTopbar";
import { DarkGridShell } from "@/components/app/DarkGridShell";
import { demoInstallations, demoUser } from "@/src/lib/demo-data";

export function OrganizationSelectScreen() {
  const installation = demoInstallations[0];

  return (
    <DarkGridShell>
      <AppTopbar />
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="mb-10 text-[24px] font-bold">Select where to use PullRabbit</h1>
        <div className="relative w-full max-w-[600px] border border-white/15 p-7">
          <Corner className="-left-2 -top-3" />
          <Corner className="-right-2 -top-3" />
          <Corner className="-bottom-3 -left-2" />
          <Corner className="-bottom-3 -right-2" />

          <Link
            href={`/setup/repositories?installationId=${installation.id}`}
            className="flex h-16 items-center gap-4 rounded-[8px] px-2 text-[19px] font-bold transition-colors hover:bg-white/5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-sm">
              {demoUser.name.slice(0, 1)}
            </span>
            <span>{installation.accountLogin}&apos;s repositories</span>
            <ArrowRight className="ml-auto h-5 w-5" />
          </Link>

          <a
            href="https://github.com/apps"
            className="mt-5 flex h-16 items-center gap-4 rounded-[8px] px-2 text-[19px] font-bold transition-colors hover:bg-white/5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[6px] bg-white/10">
              <GitHubIcon />
            </span>
            <span>Add another organization from GitHub</span>
            <ExternalLink className="ml-auto h-5 w-5" />
          </a>
        </div>
      </section>
    </DarkGridShell>
  );
}

function Corner({ className }: { className: string }) {
  return <span className={`absolute text-2xl leading-none text-white ${className}`}>+</span>;
}

function GitHubIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
