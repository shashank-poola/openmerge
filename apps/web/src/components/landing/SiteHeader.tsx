import Link from "next/link";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "PullRabbit Vs", href: "#competitors" },
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com/pullrabbit/pullrabbit" },
];

export function SiteHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-white/8 px-10 text-[14px]">
      <Link href="/" className="font-bold text-white tracking-tight">
        pullrabbit
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
