import Link from "next/link";
import type { ReactNode } from "react";
import { Alert02Icon, ArrowRight02Icon, BulbIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";

// Docs use Geist Mono (scoped via the docs layout) for code.
export const mono = "font-[family-name:var(--font-geist-mono)]";

export { CodeBlock };

export function DocHeader({ group, title, description }: { group: string; title: string; description: string }) {
  return (
    <header className="border-b border-[#efefec] pb-8">
      <p className="text-[12px] font-medium text-[#2764d8]">{group}</p>
      <h1 className="mt-2 font-pixel text-[34px] font-semibold leading-[1.1] tracking-[-0.045em] text-[#171717] sm:text-[40px]">{title}</h1>
      <p className="mt-3 max-w-[620px] text-[16px] leading-7 text-[#5f5f5b]">{description}</p>
    </header>
  );
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group mt-12 scroll-mt-24 font-pixel text-[23px] font-semibold tracking-[-0.03em] text-[#171717]">
      <a href={`#${id}`} className="relative">
        {children}
        <span className="ml-2 text-[#c4c4bf] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
          #
        </span>
      </a>
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mt-8 scroll-mt-24 text-[16px] font-semibold tracking-[-0.01em] text-[#171717]">
      {children}
    </h3>
  );
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-4 text-[15px] leading-7 text-[#4a4a47]", className)}>{children}</p>;
}

export function Code({ children }: { children: ReactNode }) {
  return <code className={cn(mono, "rounded-md border border-[#ebebe8] bg-[#f6f6f4] px-1.5 py-0.5 text-[12.5px] text-[#2b2b29]")}>{children}</code>;
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  const className = "font-medium text-[#2764d8] underline decoration-[#c9d8f6] underline-offset-4 transition-colors hover:decoration-[#2764d8]";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-[15px] leading-7 text-[#4a4a47]">
          <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#c4c4bf]" aria-hidden="true" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ steps }: { steps: Array<{ title: string; body: ReactNode }> }) {
  return (
    <ol className="relative mt-6 space-y-7">
      <span className="absolute bottom-3 left-[13px] top-3 w-px bg-[#e6e6e3]" aria-hidden="true" />
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4">
          <span className={cn(mono, "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-[#e4e4e1] bg-white text-[12px] font-medium text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.05)]")}>
            {index + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[15px] font-semibold text-[#171717]">{step.title}</p>
            <div className="mt-1 text-[15px] leading-7 text-[#4a4a47]">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

const calloutTones = {
  note: { icon: InformationCircleIcon, box: "border-[#d6e2fa] bg-[#f5f8ff]", iconColor: "text-[#2764d8]", title: "text-[#1d4596]" },
  tip: { icon: BulbIcon, box: "border-[#d2ecdc] bg-[#f4fbf6]", iconColor: "text-[#1f9d55]", title: "text-[#17663f]" },
  warning: { icon: Alert02Icon, box: "border-[#f3dfb8] bg-[#fdf9f0]", iconColor: "text-[#b7791f]", title: "text-[#7c5413]" },
} as const;

export function Callout({ tone = "note", title, children }: { tone?: keyof typeof calloutTones; title?: string; children: ReactNode }) {
  const meta = calloutTones[tone];
  return (
    <div className={cn("mt-6 flex gap-3 rounded-xl border px-4 py-3.5", meta.box)}>
      <HugeiconsIcon icon={meta.icon} size={18} strokeWidth={1.8} className={cn("mt-0.5 shrink-0", meta.iconColor)} aria-hidden="true" />
      <div className="min-w-0 text-[14px] leading-6 text-[#3f3f3c]">
        {title ? <p className={cn("font-semibold", meta.title)}>{title}</p> : null}
        <div className={title ? "mt-0.5" : undefined}>{children}</div>
      </div>
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-[#ebebe8]">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#ebebe8] bg-[#fafaf9]">
            {headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-2.5 text-[12px] font-medium text-[#6b6b67]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[#f1f1ef] align-top last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cn("px-4 py-3 leading-6", cellIndex === 0 ? "font-medium text-[#171717]" : "text-[#4a4a47]")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LinkCards({ cards }: { cards: Array<{ href: string; title: string; description: string }> }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Link key={card.href} href={card.href} className="group rounded-xl border border-[#ebebe8] bg-white p-4 transition-colors hover:border-[#d6d6d2] hover:bg-[#fafaf9]">
          <p className="flex items-center justify-between text-[14px] font-semibold text-[#171717]">
            {card.title}
            <HugeiconsIcon icon={ArrowRight02Icon} size={15} strokeWidth={1.8} className="text-[#a3a39e] transition-transform group-hover:translate-x-0.5 group-hover:text-[#171717]" aria-hidden="true" />
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#6b6b67]">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-md border border-[#ebebe8] bg-white px-2 py-0.5 text-[12px] font-medium", className)}>{children}</span>;
}
