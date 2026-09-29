import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, ArrowUpRight01Icon, BotIcon, FlowConnectionIcon } from "@hugeicons/core-free-icons";

const steps = [
  {
    number: "01",
    title: "Connect GitHub",
    description: "Install the app and choose the repositories you want reviewed.",
    tone: "bg-[#e8f0ff]",
    accent: "text-[#2e6cf6]",
    preview: (
      <div className="space-y-3 rounded-[12px] border border-black/[0.09] bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(16,24,40,0.06),0_4px_10px_-2px_rgba(16,24,40,0.08),0_18px_30px_-14px_rgba(16,24,40,0.16)]">
        <div className="flex items-center justify-between gap-2 text-[12px] text-[#202020]">
          <div className="flex items-center gap-2 font-semibold">
            <Image src="/companies/openmerge.png" alt="" width={28} height={28} className="size-7 rounded-lg object-cover" />
            <span><span className="block">OpenMerge</span><span className="block text-[10px] font-normal text-[#80838b]">GitHub App</span></span>
          </div>
          <span className="rounded-md border border-[#bfe3cb] bg-[#effaf2] px-1.5 py-0.5 text-[10px] font-semibold text-[#1f7a3d]">Connected</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-black/[0.06] bg-[#f7f8fa] px-3 py-2.5 text-[11px] font-medium text-[#3f4350]">
          <span>Repositories</span>
          <span className="rounded-md border border-[#c9d9fb] bg-[#eef3ff] px-1.5 py-0.5 font-semibold text-[#2458c9]">3 selected</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#3f4350]"><span className="size-2 rounded-full bg-[#31b36b] ring-2 ring-[#31b36b]/15" /> GitHub connected</div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Every diff gets a second set of eyes",
    description: "Security, performance, and code quality agents read the same change in parallel.",
    tone: "bg-[#fff1df]",
    accent: "text-[#e57620]",
    preview: (
      <div className="relative h-[210px] overflow-hidden rounded-[12px] border border-black/[0.09] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(16,24,40,0.06),0_4px_10px_-2px_rgba(16,24,40,0.08),0_18px_30px_-14px_rgba(16,24,40,0.16)]">
        <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-black/[0.09] bg-white px-3 py-2 text-[11px] font-semibold text-[#1f1f1f] shadow-[0_1px_2px_rgba(16,24,40,0.08)]">
          <span className="grid size-6 place-items-center rounded-md border border-[#f6cfa6] bg-[#fff1e2] text-[#c85a0b]"><HugeiconsIcon icon={FlowConnectionIcon} size={14} strokeWidth={1.8} aria-hidden="true" /></span>
          Orchestrator
        </div>
        <div className="absolute left-1/2 top-[54px] h-7 border-l border-dashed border-[#f1a86b]" />
        <div className="absolute left-[16.6667%] right-[16.6667%] top-[81px] border-t border-dashed border-[#f1a86b]" />
        <div className="absolute left-[16.6667%] top-[81px] h-5 border-l border-dashed border-[#f1a86b]" />
        <div className="absolute left-1/2 top-[81px] h-5 border-l border-dashed border-[#f1a86b]" />
        <div className="absolute right-[16.6667%] top-[81px] h-5 border-l border-dashed border-[#f1a86b]" />
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2">
          {["Quality", "Security", "Performance"].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-lg border border-black/[0.07] bg-white px-2 py-2.5 text-center text-[10px] font-medium text-[#3f4350] shadow-[0_1px_1px_rgba(16,24,40,0.04)]">
              <span className="grid size-6 place-items-center rounded-md border border-[#f6cfa6] bg-[#fff1e2] text-[#c85a0b]"><HugeiconsIcon icon={BotIcon} size={13} strokeWidth={1.8} aria-hidden="true" /></span>
              <span>{label}</span>
              <span className="size-1.5 rounded-full bg-[#e57620]" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Review, fix, merge",
    description: "Findings land on the lines that changed, with enough context to act on them quickly.",
    tone: "bg-[#eaf8ee]",
    accent: "text-[#199653]",
    preview: (
      <div className="space-y-4 rounded-[12px] border border-black/[0.09] bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(16,24,40,0.06),0_4px_10px_-2px_rgba(16,24,40,0.08),0_18px_30px_-14px_rgba(16,24,40,0.16)]">
        <div className="flex items-center justify-between border-b border-black/[0.07] pb-4 text-[11px] font-medium text-[#3f4350]">
          <span className="flex items-center gap-2"><Image src="/companies/openmerge.png" alt="" width={22} height={22} className="size-[22px] rounded-md object-cover" />OpenMerge review</span>
          <span>PR #42</span>
        </div>
        <div className="space-y-2.5 text-[11px] text-[#3f4350]">
          <div className="flex items-center gap-2"><HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} strokeWidth={1.8} className="text-[#199653]" aria-hidden="true" />No blocking findings</div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#199653]" />Summary posted to the PR</div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#199653]" />Review history saved</div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[#b9e0c6] bg-[#effaf2] px-3 py-2.5 text-[11px] font-semibold text-[#177a44] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          Looks good to merge
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
        </div>
      </div>
    ),
  },
];

export function FeaturesGrid() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto mb-14 max-w-[620px] text-center">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#737373]">How it works</p>
        <h2 className="font-pixel text-4xl leading-[1.08] tracking-[-0.04em] text-[#171717] sm:text-5xl">A calmer path to merge.</h2>
        <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-7 text-[#656565]">OpenMerge turns a noisy pull request into a short, useful conversation with your team.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {steps.map((step) => (
          <article key={step.number} className="overflow-hidden rounded-[24px] border border-[#e3e3df] bg-white shadow-[0_10px_34px_rgba(23,23,23,0.055)]">
            <div className={`m-3 flex min-h-[260px] items-center justify-center rounded-[18px] border border-white p-6 ${step.tone}`}>
              <div className="w-full max-w-[290px]">{step.preview}</div>
            </div>
            <div className="px-7 pb-8 pt-3">
              <div className={`mb-3 text-[12px] font-semibold ${step.accent}`}>{step.number}</div>
              <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#171717]">{step.title}</h3>
              <p className="mt-3 text-[14px] leading-6 text-[#686868]">{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
