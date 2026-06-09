import Link from "next/link";

const footerLinks = [
  { label: "GitHub [2.1K]", href: "https://github.com/pullrabbit/pullrabbit" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "#" },
  { label: "Discord", href: "#" },
  { label: "X", href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/8">
      <div className="grid grid-cols-2 divide-x divide-white/8 border-b border-white/8 md:grid-cols-5">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center justify-center py-6 text-[13px] text-[#555] transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-10 py-5 text-[12px] text-[#444]">
        <span>©2026 PullRabbit Labs</span>
        <div className="flex gap-5">
          <Link href="#" className="transition-colors hover:text-[#888]">Brand</Link>
          <Link href="/privacy" className="transition-colors hover:text-[#888]">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-[#888]">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
