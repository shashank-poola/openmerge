const competitors = [
  {
    name: "CodeRabbit",
    points: [
      "Runs a single sequential AI pass on each PR.",
      "No parallel multi-agent architecture — one model, one pass.",
      "PullRabbit runs three specialized agents simultaneously: security, performance, and code quality.",
    ],
  },
  {
    name: "Greptile",
    points: [
      "A codebase Q&A tool — answer questions about your code through chat.",
      "Not designed for automated PR review workflows or inline comments.",
      "PullRabbit automates the full review pipeline end-to-end without human prompting.",
    ],
  },
  {
    name: "Graphite",
    points: [
      "A PR workflow tool optimized for stacked diffs and fast review queues.",
      "No AI-powered review agents — humans still do all the reviewing.",
      "PullRabbit works alongside Graphite to bring automated AI review to every stack.",
    ],
  },
  {
    name: "Kilo",
    points: [
      "An AI coding assistant that helps engineers write new code.",
      "Does not review pull requests or post inline diff comments.",
      "PullRabbit handles the post-commit review stage — after the code is written.",
    ],
  },
];

export function CompetitorsSection() {
  return (
    <section id="competitors" className="border-t border-white/8 px-10 py-24">
      <h2 className="mb-2 text-[18px] font-bold text-white">PullRabbit vs</h2>
      <p className="mb-14 text-[13px] text-[#555]">
        How PullRabbit compares to other tools in the developer workflow.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {competitors.map((c) => (
          <div key={c.name} className="border border-white/8 px-7 py-6">
            <p className="mb-5 text-[13px] font-bold text-[#555]">vs {c.name}</p>
            <ul className="space-y-3">
              {c.points.map((point, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-[#444] select-none">—</span>
                  <span className={i === 2 ? "text-white" : "text-[#777]"}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
