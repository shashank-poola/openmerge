"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ExternalLinkIcon } from "@hugeicons/core-free-icons";
import { AppTopbar } from "@/components/app/AppTopbar";
import { demoInstallations, demoUser } from "@/src/lib/demo-data";

export function OrganizationSelectScreen() {
  const installation = demoInstallations[0];

  return (
    <div className="min-h-screen bg-[#131010] font-mono text-white">
      <AppTopbar />
      <section className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="mb-8 text-[20px] font-bold text-white">
          Select where to use PullRabbit
        </h1>

        <div className="w-full max-w-[560px] border border-white/8">
          <Link
            href={`/setup/repositories?installationId=${installation.id}`}
            className="flex h-16 items-center gap-4 border-b border-white/8 px-5 text-[14px] font-bold text-white transition-colors hover:bg-white/4"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/8 text-[11px]">
              {demoUser.name.slice(0, 1)}
            </span>
            <span>{installation.accountLogin}&apos;s repositories</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.5} className="ml-auto text-[#555]" />
          </Link>

          <a
            href="https://github.com/apps"
            className="flex h-16 items-center gap-4 px-5 text-[14px] font-bold text-white transition-colors hover:bg-white/4"
          >
            <span className="grid h-8 w-8 place-items-center border border-white/8 bg-white/5">
              <GitHubIcon />
            </span>
            <span>Add another organization from GitHub</span>
            <HugeiconsIcon icon={ExternalLinkIcon} size={15} strokeWidth={1.5} className="ml-auto text-[#555]" />
          </a>
        </div>
      </section>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
