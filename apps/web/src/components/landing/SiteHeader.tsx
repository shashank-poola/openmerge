import Link from "next/link";
import { PullRabbitMark } from "@/components/landing/brand/PullRabbitMark";

const navItems = ["Changelog", "Docs", "Enterprise", "Join Us"];

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-28 w-full max-w-[1512px] items-start justify-between px-7 pt-5 font-mono text-[16px] text-pr-muted md:px-12 lg:px-[196px]">
      <Link href="/" aria-label="PullRabbit home" className="mt-3 block">
        <PullRabbitMark />
      </Link>

      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
        {navItems.map((item) => (
          <Link key={item} href="#" className="transition-colors hover:text-pr-ink">
            {item}
          </Link>
        ))}
        <Link
          href="/dashboard"
          className="flex h-10 items-center gap-3 rounded-[8px] bg-pr-charcoal px-4 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Download
          <kbd className="rounded-[7px] border border-white/20 bg-white/20 px-2 py-1 text-[13px] font-normal leading-none text-white/85">
            D
          </kbd>
        </Link>
      </nav>
    </header>
  );
}
