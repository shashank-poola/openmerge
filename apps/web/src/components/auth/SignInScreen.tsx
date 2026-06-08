"use client";

import { Server } from "lucide-react";
import { signIn } from "next-auth/react";
import { PullRabbitLogo } from "@/components/brand/PullRabbitLogo";
import { DarkGridShell } from "@/components/app/DarkGridShell";

const trusted = ["shopify", "snowflake", "Figma", "DATADOG", "Harvey", "duolingo", "ramp", "asana"];

export function SignInScreen() {
  return (
    <DarkGridShell>
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="relative w-full max-w-[480px] border border-white/15 px-10 pb-12 pt-9">
          <Corner className="-left-2 -top-2" />
          <Corner className="-right-2 -top-2" />
          <Corner className="-bottom-2 -left-2" />
          <Corner className="-bottom-2 -right-2" />

          <div className="mb-20 flex justify-center">
            <PullRabbitLogo className="text-white" markClassName="border-white/30" />
          </div>
          <h1 className="mb-8 text-center text-[21px] font-bold">Welcome back to PullRabbit</h1>
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/setup/loading" })}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-[#315bdc] text-[16px] font-bold text-white transition-colors hover:bg-[#3e6af0]"
            >
              <GitHubIcon />
              Log in with GitHub
            </button>
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-[#242426] text-[16px] font-bold text-white transition-colors hover:bg-[#2f2f31]"
            >
              <Server className="h-5 w-5" />
              Log in with self-hosted GitHub
            </button>
          </div>
          <p className="mt-16 text-center text-[14px] font-bold">
            Do not have an account yet? <button onClick={() => signIn("github", { callbackUrl: "/setup/loading" })}>Sign up</button>
          </p>
        </div>

        <div className="relative z-10 mt-8 w-full max-w-[480px] border border-white/15 px-8 py-8 text-center">
          <p className="mb-6 text-sm text-white/60">Trusted by</p>
          <div className="grid grid-cols-4 gap-x-6 gap-y-5 text-[18px] font-bold text-white/45">
            {trusted.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>

        <p className="absolute bottom-8 z-10 max-w-[520px] text-center text-[14px] font-bold leading-relaxed">
          By signing up you acknowledge that you read and agree to our Terms of Service and Privacy Policy.
        </p>
      </section>
    </DarkGridShell>
  );
}

function Corner({ className }: { className: string }) {
  return <span className={`absolute text-2xl leading-none text-white ${className}`}>+</span>;
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
