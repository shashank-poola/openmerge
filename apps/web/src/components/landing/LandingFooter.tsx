import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "GitHub", href: "https://github.com/pullrabbit/pullrabbit" },
  { label: "Docs", href: "/docs" },
  { label: "PullRabbit", href: "/" },
  { label: "Install", href: "https://github.com/apps/pull-rabbit/installations/select_target" },
  { label: "X", href: "https://x.com/shashank-poola" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/8">
      <div className="grid grid-cols-2 divide-x divide-white/8 border-b border-white/8 md:grid-cols-5">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center justify-center py-6 text-[13px] text-[#555]
              transition-colors duration-150 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-10 py-5 text-[12px] text-[#444]">
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Image
            src="/pullrabbit/reclogo.png"
            alt="PullRabbit"
            width={100}
            height={24}
            className="h-6 w-auto opacity-40"
          />
        </Link>
        <div className="flex gap-5">
          <Link href="#" className="transition-colors duration-150 hover:text-[#888]">Brand</Link>
          <Link href="/privacy" className="transition-colors duration-150 hover:text-[#888]">Privacy</Link>
          <Link href="/terms" className="transition-colors duration-150 hover:text-[#888]">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
