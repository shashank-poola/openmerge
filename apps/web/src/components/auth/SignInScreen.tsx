"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { PageShell } from "@/components/layout/PageShell";

export function SignInScreen() {
  return (
    <PageShell>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center border-b border-white/8 px-10">
          <Link href="/" className="text-[14px] font-bold text-white tracking-tight">
            pullrabbit
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center px-10 py-20">
          <div className="w-full max-w-[380px]">
            <h1 className="mb-3 text-[28px] font-bold leading-tight text-white">
              Sign in to PullRabbit
            </h1>
            <p className="mb-10 text-[14px] leading-relaxed text-[#777]">
              Connect your GitHub account to start reviewing pull requests with AI.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/account" })}
                className="flex h-12 w-full items-center justify-between bg-white px-5 text-[14px] font-bold text-black transition-colors hover:bg-[#e8e8e8]"
              >
                <span className="flex items-center gap-3">
                  <GitHubIcon />
                  Sign in with GitHub
                </span>
                <span>→</span>
              </button>

              <button
                type="button"
                className="flex h-12 w-full items-center justify-between border border-white/15 px-5 text-[14px] text-[#777] transition-colors hover:border-white/30 hover:text-white"
              >
                <span>Continue with self-hosted GitHub</span>
                <span>→</span>
              </button>
            </div>

            <p className="mt-8 text-[12px] leading-relaxed text-[#444]">
              By signing in you agree to our{" "}
              <Link href="/terms" className="text-[#666] hover:text-white">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#666] hover:text-white">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <footer className="border-t border-white/8 px-10 py-4 flex items-center justify-between text-[12px] text-[#444]">
          <span>©2026 PullRabbit Labs</span>
          <div className="flex gap-5">
            <Link href="/docs" className="transition-colors hover:text-[#888]">Docs</Link>
            <Link href="https://github.com/pullrabbit/pullrabbit" className="transition-colors hover:text-[#888]">GitHub</Link>
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
