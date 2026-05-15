"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#0A0A0A] bg-[#EAF0EF]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-[#0A0A0A] tracking-tight text-sm">
            <span>🐇</span>
            <span>pullrabbit</span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/features"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#enterprise"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              Enterprise
            </Link>
            <Link
              href="#blog"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Right side CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="#signin"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors hidden md:block"
            >
              Sign In
            </Link>
            <Link
              href="#signup"
              className="bg-[#0A0A0A] text-[#EAF0EF] px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-[#4D4D4D] transition-colors"
            >
              Try For Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
