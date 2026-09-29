"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Alert02Icon, ArrowLeft01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DotmSquare3 } from "@/components/ui/dotm-square-3";
import { cn } from "@/lib/utils";

export type ConnectState = "working" | "success" | "error";

const STEP_INTERVAL_MS = 1_400;

/**
 * Walks the highlight through the steps while the request is in flight. The last
 * step stays active until the server responds; nothing is marked done early.
 */
function useActiveStep(stepCount: number, running: boolean) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!running) return;
    const intervalId = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, stepCount - 1));
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [running, stepCount]);

  return activeStep;
}

const loaderColor: Record<ConnectState, string> = {
  working: "#2764d8",
  success: "#1f9d55",
  error: "#d93b3b",
};

export function ConnectScreen({
  state,
  eyebrow,
  title,
  description,
  steps,
  actions,
}: {
  state: ConnectState;
  eyebrow: string;
  title: string;
  description: ReactNode;
  steps?: string[];
  actions?: ReactNode;
}) {
  const activeStep = useActiveStep(steps?.length ?? 0, state === "working");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9f9f8] text-[#171717]">
      <div className="om-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,black_20%,transparent_75%)]" aria-hidden="true" />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-[38%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] transition-colors duration-700",
          state === "working" && "bg-[#2764d8]/[0.09]",
          state === "success" && "bg-[#1f9d55]/[0.10]",
          state === "error" && "bg-[#d93b3b]/[0.08]"
        )}
        aria-hidden="true"
      />

      <header className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="OpenMerge home">
          <Image src="/companies/openmerge.png" alt="" width={30} height={30} className="size-[30px] rounded-[9px] object-cover" priority />
          <span className="font-pixel text-[17px] font-semibold tracking-[-0.04em]">OpenMerge</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-[#6b6b67] transition-colors hover:bg-[#efefed] hover:text-[#171717]">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.8} aria-hidden="true" />
          Back home
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-12">
        <div className="om-rise w-full max-w-[420px] text-center" role="status" aria-live="polite">
          <div className="relative mx-auto grid size-[88px] place-items-center rounded-[26px] border border-[#ebebe8] bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_40px_rgba(0,0,0,0.08)]">
            <DotmSquare3 key={state} size={44} dotSize={6} animated={state === "working"} speed={1.1} color={loaderColor[state]} bloom={state === "working"} />
          </div>

          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.18em] text-[#a3a39e]">{eyebrow}</p>
          <h1 className={cn("mt-2 font-pixel text-[30px] font-semibold leading-tight tracking-[-0.045em] sm:text-[34px]", state === "working" && "om-text-shine")}>{title}</h1>
          <p className="mx-auto mt-2.5 max-w-[360px] text-[14px] leading-6 text-[#6b6b67]">{description}</p>

          {steps?.length && state !== "error" ? (
            <ol className="mt-8 overflow-hidden rounded-2xl border border-[#ebebe8] bg-white/90 p-1.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur">
              {steps.map((step, index) => {
                const done = state === "success" || index < activeStep;
                const active = state === "working" && index === activeStep;
                return (
                  <li
                    key={step}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors duration-300",
                      active ? "bg-[#f6f7fb] text-[#171717]" : done ? "text-[#3f3f3c]" : "text-[#a3a39e]"
                    )}
                    style={state === "success" ? { transitionDelay: `${index * 90}ms` } : undefined}
                  >
                    <StepIndicator done={done && state === "success"} active={active} passed={done && state !== "success"} />
                    <span className="flex-1">{step}</span>
                    {active ? <span className="text-[11px] text-[#2764d8]">In progress</span> : null}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {state === "error" ? (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#f1d6d3] bg-[#fdf6f5] px-4 py-3 text-left text-[13px] text-[#9f3a31]">
              <HugeiconsIcon icon={Alert02Icon} size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>If this keeps happening, check that the OpenMerge API is reachable and try the GitHub flow again.</p>
            </div>
          ) : null}

          {actions ? <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">{actions}</div> : null}
        </div>
      </main>

      <footer className="relative z-10 flex h-16 items-center justify-center px-5 text-[12px] text-[#a3a39e]">Open source, built in public.</footer>
    </div>
  );
}

function StepIndicator({ done, active, passed }: { done: boolean; active: boolean; passed: boolean }) {
  if (done) {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#1f9d55] text-white">
        <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={2.6} aria-hidden="true" />
      </span>
    );
  }

  if (active) {
    return (
      <span className="relative grid size-5 shrink-0 place-items-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[1.5px] border-[#d6e2fa] border-t-[#2764d8]" />
        <span className="size-1.5 rounded-full bg-[#2764d8]" />
      </span>
    );
  }

  // Steps the highlight has moved past stay muted until the server confirms them.
  if (passed) {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eef2fb] text-[#7d9ad6]" aria-hidden="true">
        <HugeiconsIcon icon={Tick02Icon} size={11} strokeWidth={2.4} />
      </span>
    );
  }

  return <span className="size-5 shrink-0 rounded-full border-[1.5px] border-[#e4e4e1]" aria-hidden="true" />;
}

export const connectButtonStyles = {
  primary:
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-[#2b2b2b] sm:w-auto",
  secondary:
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#e4e4e1] bg-white px-5 text-[13px] font-medium text-[#2b2b29] transition-colors hover:bg-[#fafaf9] sm:w-auto",
} as const;
