import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#0A0A0A] bg-[#EAF0EF]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top: Logo + columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo + tagline */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-[#0A0A0A] text-sm mb-3">
              <span>🐇</span>
              <span>pullrabbit</span>
            </Link>
            <p className="text-xs text-[#4D4D4D] leading-relaxed">
              AI agents that review your pull requests with full codebase context.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] mb-4">Product</p>
            <ul className="space-y-3">
              {["Pricing", "Docs", "API", "Security", "Privacy"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors tracking-wide"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] mb-4">Company</p>
            <ul className="space-y-3">
              {["Blog", "Case Studies", "Enterprise", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors tracking-wide"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] mb-4">Resources</p>
            <ul className="space-y-3">
              {["Documentation", "Examples", "Changelog"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors tracking-wide"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#0A0A0A] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4D4D4D] tracking-wide">
            © 2024 PullRabbit. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
