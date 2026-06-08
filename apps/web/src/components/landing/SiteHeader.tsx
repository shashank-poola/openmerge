import Link from "next/link";
import { PullRabbitMark } from "@/components/landing/brand/PullRabbitMark";

const navItems = [
  { label: "Changelog", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Features", href: "#features" },
  { label: "CLI", href: "#cli" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-28 w-full max-w-[1512px] items-start justify-between px-7 pt-5 font-mono text-[16px] text-pr-muted md:px-12 lg:px-[196px]">
      <Link href="/" aria-label="PullRabbit home" className="mt-3 block">
        <PullRabbitMark />
      </Link>

      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className="transition-colors hover:text-pr-ink">
            {item.label}
          </Link>
        ))}
        <Link
          href="/signin"
          className="flex h-10 items-center gap-3 rounded-[8px] bg-pr-charcoal px-4 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Signin
          <kbd className="rounded-[7px] border border-white/20 bg-white/20 px-2 py-1 text-[13px] font-normal leading-none text-white/85">
            S
          </kbd>
        </Link>
      </nav>
    </header>
  );
}
