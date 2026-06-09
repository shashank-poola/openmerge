import Link from "next/link";
import { PullRabbitMark } from "@/components/landing/brand/PullRabbitMark";

const navItems = [
  { label: "GitHub [2.1K]", href: "https://github.com/pullrabbit/pullrabbit" },
  { label: "Docs", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Features", href: "#features" },
  { label: "CLI", href: "#cli" },
];

export function SiteHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-white/8 px-10 text-[14px]">
      <Link href="/" aria-label="PullRabbit home" className="flex items-center gap-2.5">
        <PullRabbitMark color="light" />
        <span className="font-bold text-white tracking-tight">pullrabbit</span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-[#777] transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/signin"
          className="flex h-8 items-center rounded border border-white/20 px-4 text-[13px] text-white transition-colors hover:bg-white hover:text-black"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
