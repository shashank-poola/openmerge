"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { PageShell } from "@/components/layout/PageShell";
import { useClipboard } from "@/hooks/useClipboard";

export function AccountScreen() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const name = session?.user?.name ?? "";
  const { copied, copy } = useClipboard();

  function copyToken() {
    if (!token) return;
    copy(token);
  }

  return (
    <PageShell>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/8 px-10">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image src="/pullrabbit/reclogo.png" alt="PullRabbit" width={110} height={26} className="h-[26px] w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-[12px] text-[#555] transition-colors hover:text-white"
          >
            Sign out
          </button>
        </header>

        <div className="flex flex-1 flex-col px-10 py-16">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#555]">
            Signed in as {name}
          </p>
          <h1 className="mb-12 text-[24px] font-bold text-white">Get started</h1>

          {/* step 1 */}
          <div className="mb-6 border border-white/8 transition-colors hover:border-white/15">
            <div className="flex h-10 items-center gap-3 border-b border-white/8 px-5 text-[11px]">
              <span className="text-[#555]">step 1</span>
              <span className="font-bold text-white">Install the GitHub App</span>
            </div>
            <div className="px-5 py-5">
              <p className="mb-5 text-[13px] leading-relaxed text-[#777]">
                Install PullRabbit on your GitHub repositories. Select the repos you want
                reviewed — PullRabbit will start posting reviews automatically on every PR.
              </p>
              <a
                href="https://github.com/apps/pull-rabbit/installations/select_target"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-9 items-center gap-2 bg-white px-5 text-[12px]
                  font-bold text-black transition-colors hover:bg-[#e8e8e8] active:scale-[0.98]"
              >
                <GitHubIcon />
                Install on GitHub
                <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
              </a>
            </div>
          </div>

          {/* step 2 */}
          <div className="mb-6 border border-white/8 transition-colors hover:border-white/15">
            <div className="flex h-10 items-center gap-3 border-b border-white/8 px-5 text-[11px]">
              <span className="text-[#555]">step 2</span>
              <span className="font-bold text-white">Install the CLI</span>
            </div>
            <div className="px-5 py-5">
              <p className="mb-5 text-[13px] leading-relaxed text-[#777]">
                Install the PullRabbit CLI to trigger reviews on-demand from your terminal.
              </p>
              <div className="flex items-center border border-white/8 bg-[#0f0d0d] px-4 py-3 text-[12px]
                transition-colors hover:bg-[#111]">
                <code className="flex-1 text-white">npm install -g pullrabbit</code>
              </div>
            </div>
          </div>

          {/* step 3 — token */}
          <div className="border border-white/8 transition-colors hover:border-white/15">
            <div className="flex h-10 items-center gap-3 border-b border-white/8 px-5 text-[11px]">
              <span className="text-[#555]">step 3</span>
              <span className="font-bold text-white">Authenticate the CLI</span>
            </div>
            <div className="px-5 py-5">
              <p className="mb-5 text-[13px] leading-relaxed text-[#777]">
                Run this command in your terminal to authenticate the CLI with your account.
              </p>
              {token ? (
                <div className="flex items-center gap-3 border border-white/8 bg-[#0f0d0d] px-4 py-3 text-[12px]">
                  <code className="flex-1 truncate text-white">
                    pullrabbit auth --token {token.slice(0, 24)}...
                  </code>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="shrink-0 border border-white/15 px-3 py-1 text-[11px]
                      text-[#777] transition-colors hover:text-white"
                  >
                    {copied ? "copied ✓" : "copy"}
                  </button>
                </div>
              ) : (
                <div className="border border-white/8 bg-[#0f0d0d] px-4 py-3 text-[12px] text-[#444]">
                  Token unavailable — backend server not running.
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-white/8 px-10 py-4 text-[12px] text-[#444]">
          <span>©2026 PullRabbit Labs</span>
          <div className="flex gap-5">
            <Link href="/docs" className="transition-colors hover:text-[#888]">Docs</Link>
            <Link href="/privacy" className="transition-colors hover:text-[#888]">Privacy</Link>
          </div>
        </footer>
      </div>
    </PageShell>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
