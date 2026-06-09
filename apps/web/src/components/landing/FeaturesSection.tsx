import Link from "next/link";

const features = [
  { name: "Multi-agent review", description: "Run security, performance, and code quality agents in parallel" },
  { name: "Inline comments", description: "AI posts review comments directly on your PR diff" },
  { name: "GitHub App", description: "Installs in 30 seconds — no configuration required" },
  { name: "Any LLM", description: "Use Claude, GPT-4o, Gemini, or any other model provider" },
  { name: "PR dashboard", description: "Track all open PRs and their review status in one place" },
  { name: "CLI support", description: "Trigger reviews and manage settings from the terminal" },
  { name: "Team workflows", description: "Works across all repositories in your GitHub organization" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/8 px-10 py-24">
      <h2 className="mb-8 text-[18px] font-bold text-white">What is PullRabbit?</h2>
      <p className="mb-10 max-w-[580px] text-[14px] leading-relaxed text-[#777]">
        PullRabbit is an open source AI-powered GitHub App that runs parallel review
        agents on every pull request and posts inline comments automatically.
      </p>

      <ul className="mb-12 space-y-4">
        {features.map((f) => (
          <li key={f.name} className="flex items-start gap-4 text-[14px]">
            <span className="shrink-0 select-none text-[#444]">[*]</span>
            <span>
              <span className="font-bold text-white">{f.name}</span>
              <span className="text-[#777]">{"  "}{f.description}</span>
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="#"
        className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 text-[13px] text-white transition-colors hover:bg-white hover:text-black"
      >
        Read docs →
      </Link>
    </section>
  );
}
