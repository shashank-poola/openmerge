import Link from "next/link";

const groups = [
  { title: "Company", links: ["Blog", "Features", "CLI"] },
  { title: "Resources", links: ["Docs", "Workflows", "Changelog", "Brand kit"] },
  { title: "Compare", links: ["Compare tools", "PullRabbit vs Copilot", "PullRabbit vs Codex"] },
  { title: "Legal", links: ["Privacy", "Terms"] },
  { title: "Connect", links: ["X", "YouTube", "GitHub"] },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#1d1917] px-6 py-20 font-mono text-[#d7cfca] md:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-6">[{group.title}]</p>
            <ul className="space-y-4 text-white">
              {group.links.map((link) => (
                <li key={link}>
                  <Link href="#" className="transition-opacity hover:opacity-70">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-20 max-w-[1440px] text-[#d7cfca]">© 2026 PullRabbit Labs</div>
    </footer>
  );
}
