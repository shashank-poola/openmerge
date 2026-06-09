import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

const nav = [
  {
    section: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Quick Start Guide", href: "/docs/quick-start" },
      { label: "Install GitHub App", href: "/docs/install" },
    ],
  },
  {
    section: "Configuration",
    items: [
      { label: "Agents & Rules", href: "/docs/agents" },
      { label: "Ignore Patterns", href: "/docs/ignore-patterns" },
    ],
  },
  {
    section: "Agents",
    items: [
      { label: "Code Quality Agent", href: "/docs/agents/code-quality" },
      { label: "Security Agent", href: "/docs/agents/security" },
      { label: "Performance Agent", href: "/docs/agents/performance" },
    ],
  },
  {
    section: "API Reference",
    items: [
      { label: "Webhook Events", href: "/docs/api/webhooks" },
      { label: "REST API", href: "/docs/api/rest" },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#131010] font-mono text-white">
      {/* top nav */}
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-white/8 bg-[#131010] px-5">
        <Link href="/" className="text-[13px] font-bold text-white tracking-tight">
          pullrabbit
        </Link>
        <div className="flex items-center gap-4 text-[12px] text-[#555]">
          <Link href="/docs" className="hover:text-white">Docs</Link>
          <Link href="https://github.com/pullrabbit/pullrabbit" className="hover:text-white">GitHub</Link>
          <Link
            href="/signin"
            className="border border-white/15 px-3 py-1 text-[11px] text-white hover:bg-white hover:text-black"
          >
            Sign in
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* sidebar */}
        <aside className="sticky top-12 h-[calc(100vh-3rem)] w-[220px] shrink-0 overflow-y-auto border-r border-white/8 px-4 py-5">
          <div className="mb-4 flex items-center gap-2 border border-white/8 px-3 py-2 text-[11px] text-[#444]">
            <span>Search ...</span>
            <span className="ml-auto text-[10px] border border-white/8 px-1">Ctrl K</span>
          </div>

          <nav className="space-y-5 text-[12px]">
            {nav.map((group) => (
              <div key={group.section}>
                <p className="mb-1 flex items-center gap-1.5 font-bold text-[#888]">
                  <span className="text-[10px]">⊞</span>
                  {group.section}
                </p>
                <ul className="space-y-0.5 pl-4">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-1 text-[#555] transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
