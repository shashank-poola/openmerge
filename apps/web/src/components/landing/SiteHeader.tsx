import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "OpenMerge Vs", href: "#competitors" },
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com/shashank-poola/openmerge/" },
];

export function SiteHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-white/8 px-10 text-[14px]">
      <Link
        href="/"
        className="transition-opacity duration-150 hover:opacity-80"
      >
        <Image
          src="/openmerge/reclogo.png"
          alt="OpenMerge"
          width={160}
          height={50}
          className="h-12 w-auto"
          priority
        />
      </Link>

      <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="relative text-[#777] transition-colors duration-150 hover:text-white
              after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0
              after:bg-white/50 after:transition-[width] after:duration-200 hover:after:w-full"
          >
            {item.label}
          </Link>
        ))}

        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/github`}
          className="group flex h-8 items-center gap-1.5 bg-white px-4 text-[12px] font-bold text-black
            transition-all duration-150 hover:bg-[#e8e8e8] active:scale-[0.97]"
        >
          Sign in
          <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </a>
      </nav>
    </header>
  );
}
