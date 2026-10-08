import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { DemoVideo } from "./DemoVideo";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-[1180px] px-6 pb-20 pt-12 text-center sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
      <div className="relative z-10 mx-auto inline-flex items-center gap-2 rounded-full border border-[#dadad5] bg-white px-4 py-2 text-[12px] font-medium text-[#676762] shadow-[0_3px_10px_rgba(23,23,23,0.07)]">
        <span className="size-1.5 rounded-full bg-[#35a853] shadow-[0_0_0_3px_rgba(53,168,83,0.12)]" />
        Open source PR reviews for teams who ship
      </div>

      <h1 className="relative z-10 mx-auto mt-7 max-w-[820px] font-pixel text-[clamp(1rem,13vw,6rem)] leading-[0.94] tracking-[-0.065em] text-[#171717]">
        AI code review for
        <br />
        <span className="text-[#2764d8]">every pull request.</span>
      </h1>
      <p className="mx-auto mt-8 max-w-[600px] text-[17px] leading-7 text-[#686864] sm:text-[19px]">
        OpenMerge reads every pull request with focused AI agents, explains what matters, and leaves your team with a clear path to merge.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="https://github.com/apps/openmerge-app/installations/select_target"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#171717] px-6 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
        >
          Install on GitHub
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
        <Link
          href="#how-it-works"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#deded8] bg-white px-6 text-[14px] font-semibold text-[#33332f] transition-colors hover:border-[#bdbdb6] hover:bg-[#fafaf7]"
        >
          See how it works
        </Link>
      </div>

      <div id="demo" className="mx-auto mt-20 max-w-[980px] overflow-hidden rounded-[24px] border border-[#dcdcd8] bg-[#fafaf8] shadow-[0_15px_40px_rgba(23,23,23,0.035)]">
        <DemoVideo />
      </div>
    </section>
  );
}
