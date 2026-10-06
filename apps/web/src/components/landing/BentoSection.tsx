"use client";

// Layout and hover animations replicate Aceternity UI's "Bento Grid" demo 3,
// with OpenMerge content in each card header.
import Image from "next/image";
import { motion } from "motion/react";
import { BotIcon, CheckmarkCircle02Icon, Comment01Icon, FilterIcon, Layers01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";

export function BentoSection() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-[#eeeeee] px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto mb-14 max-w-[620px] text-center">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#737373]">Features</p>
        <h2 className="font-pixel text-4xl leading-[1.08] tracking-[-0.04em] text-[#171717] sm:text-5xl">Everything a review needs.</h2>
        <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-7 text-[#656565]">
          Context from the whole repository, three focused agents, and one clear answer on every pull request.
        </p>
      </div>

      <BentoGrid className="mx-auto max-w-4xl md:auto-rows-[20rem]">
        {items.map((item) => (
          <BentoGridItem
            key={item.title}
            title={item.title}
            description={item.description}
            header={item.header}
            className={cn("[&>p:text-lg]", item.className)}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </section>
  );
}

const Bot = ({ className }: { className?: string }) => (
  <Image src="/companies/openmerge.png" alt="" width={24} height={24} className={cn("h-6 w-6 shrink-0 rounded-full", className)} />
);

const Dev = () => <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-[#2764d8] to-[#5b8def]" />;

/** Inline findings: comment bubbles on changed lines sway apart on hover. */
const SkeletonOne = () => {
  const variants = { initial: { x: 0 }, animate: { x: 10, rotate: 5, transition: { duration: 0.2 } } };
  const variantsSecond = { initial: { x: 0 }, animate: { x: -10, rotate: -5, transition: { duration: 0.2 } } };

  return (
    <motion.div initial="initial" whileHover="animate" className="om-bg-dot flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2">
      <motion.div variants={variants} className="flex flex-row items-center space-x-2 rounded-full border border-neutral-100 bg-white p-2">
        <Bot />
        <p className="truncate font-mono text-[11px] text-neutral-500">session.ts:42 · High · timing-unsafe compare</p>
      </motion.div>
      <motion.div variants={variantsSecond} className="ml-auto flex w-3/4 flex-row items-center justify-end space-x-2 rounded-full border border-neutral-100 bg-white p-2">
        <p className="truncate text-[11px] text-neutral-500">Good catch, fixing now</p>
        <Dev />
      </motion.div>
      <motion.div variants={variants} className="flex flex-row items-center space-x-2 rounded-full border border-neutral-100 bg-white p-2">
        <Bot />
        <p className="truncate font-mono text-[11px] text-neutral-500">orders.ts:31 · Medium · N+1 query</p>
      </motion.div>
    </motion.div>
  );
};

/** Context sources: each bar fills in, and refills on hover. */
const SkeletonTwo = () => {
  const variants = {
    initial: { width: 0 },
    animate: { width: "100%", transition: { duration: 0.2 } },
    hover: { width: ["0%", "100%"], transition: { duration: 2 } },
  };
  // Fixed widths instead of the demo's Math.random(), which breaks hydration in Next.js.
  const sources = [
    { label: "diff", width: "92%" },
    { label: "ast", width: "74%" },
    { label: "code graph", width: "86%" },
    { label: "imports", width: "58%" },
    { label: "linters", width: "68%" },
    { label: "pr history", width: "80%" },
  ];

  return (
    <motion.div initial="initial" animate="animate" whileHover="hover" className="om-bg-dot flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2">
      {sources.map((source) => (
        <motion.div
          key={source.label}
          variants={variants}
          style={{ maxWidth: source.width }}
          className="flex h-4 w-full flex-row items-center space-x-2 overflow-hidden rounded-full border border-neutral-100 bg-neutral-100 px-2"
        >
          <span className="whitespace-nowrap font-mono text-[9px] leading-none text-neutral-500">{source.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

/** Signal over noise: animated brand gradient behind the review limits. */
const SkeletonThree = () => {
  const variants = { initial: { backgroundPosition: "0 50%" }, animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] } };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      className="flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2 rounded-lg"
      style={{ background: "linear-gradient(-45deg, #1d4fb8, #2764d8, #5b8def, #9ec0ff)", backgroundSize: "400% 400%" }}
    >
      <motion.div className="flex h-full w-full flex-col items-center justify-center rounded-lg text-white">
        <span className="font-pixel text-5xl font-semibold tracking-[-0.04em]">12</span>
        <span className="mt-1 text-[11px] font-medium text-white/85">comments at most, blocking first</span>
      </motion.div>
    </motion.div>
  );
};

/** Three agents: cards fan in on hover, each with the finding it caught. */
const SkeletonFour = () => {
  const first = { initial: { x: 20, rotate: -5 }, hover: { x: 0, rotate: 0 } };
  const second = { initial: { x: -20, rotate: 5 }, hover: { x: 0, rotate: 0 } };
  const cardClass = "flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-4";

  return (
    <motion.div initial="initial" animate="animate" whileHover="hover" className="om-bg-dot flex h-full min-h-[6rem] w-full flex-1 flex-row space-x-2">
      <motion.div variants={first} className={cardClass}>
        <AgentAvatar />
        <p className="mt-4 text-center text-xs font-semibold text-neutral-500 sm:text-sm">Code agent: retry loop never exits</p>
        <p className="mt-4 rounded-full border border-orange-500 bg-orange-100 px-2 py-0.5 text-xs text-orange-600">High</p>
      </motion.div>
      <motion.div className={cn(cardClass, "relative z-20")}>
        <AgentAvatar />
        <p className="mt-4 text-center text-xs font-semibold text-neutral-500 sm:text-sm">Security agent: order read without owner check</p>
        <p className="mt-4 rounded-full border border-red-500 bg-red-100 px-2 py-0.5 text-xs text-red-600">Critical</p>
      </motion.div>
      <motion.div variants={second} className={cardClass}>
        <AgentAvatar />
        <p className="mt-4 text-center text-xs font-semibold text-neutral-500 sm:text-sm">Performance agent: query inside a loop</p>
        <p className="mt-4 rounded-full border border-yellow-500 bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Medium</p>
      </motion.div>
    </motion.div>
  );
};

const AgentAvatar = () => (
  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#171717] text-white">
    <HugeiconsIcon icon={BotIcon} size={20} strokeWidth={1.8} aria-hidden="true" />
  </span>
);

/** The verdict: the summary lands, the author replies. */
const SkeletonFive = () => {
  const variants = { initial: { x: 0 }, animate: { x: 10, rotate: 5, transition: { duration: 0.2 } } };
  const variantsSecond = { initial: { x: 0 }, animate: { x: -10, rotate: -5, transition: { duration: 0.2 } } };

  return (
    <motion.div initial="initial" whileHover="animate" className="om-bg-dot flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2">
      <motion.div variants={variants} className="flex flex-row items-start space-x-2 rounded-2xl border border-neutral-100 bg-white p-2">
        <Bot className="h-10 w-10" />
        <p className="text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700">OpenMerge Summary.</span> Changes requested: 2 blocking issues in session.ts and orders.ts need attention before merging…
        </p>
      </motion.div>
      <motion.div variants={variantsSecond} className="ml-auto flex w-3/4 flex-row items-center justify-end space-x-2 rounded-full border border-neutral-100 bg-white p-2">
        <p className="text-xs text-neutral-500">Fixed both, pushing.</p>
        <Dev />
      </motion.div>
    </motion.div>
  );
};

const iconClass = "h-4 w-4 text-neutral-500";

const items = [
  {
    title: "Findings on the changed line",
    description: <span className="text-sm">Every comment lands exactly where the problem is, with a severity.</span>,
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <HugeiconsIcon icon={Comment01Icon} size={16} strokeWidth={1.8} className={iconClass} />,
  },
  {
    title: "Context beyond the diff",
    description: <span className="text-sm">AST, code graph, imports, linters, and past pull requests.</span>,
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <HugeiconsIcon icon={Layers01Icon} size={16} strokeWidth={1.8} className={iconClass} />,
  },
  {
    title: "Signal, not noise",
    description: <span className="text-sm">Duplicates dropped, ranked by severity, capped per review.</span>,
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <HugeiconsIcon icon={FilterIcon} size={16} strokeWidth={1.8} className={iconClass} />,
  },
  {
    title: "Three specialist agents",
    description: <span className="text-sm">Code, security, and performance agents review the same change in parallel.</span>,
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <HugeiconsIcon icon={BotIcon} size={16} strokeWidth={1.8} className={iconClass} />,
  },
  {
    title: "A clear verdict",
    description: <span className="text-sm">One summary tells you whether it is safe to merge.</span>,
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} strokeWidth={1.8} className={iconClass} />,
  },
];
