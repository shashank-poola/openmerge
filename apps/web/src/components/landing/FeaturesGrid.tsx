import Image from "next/image";

const features = [
  {
    name: "Multi-agent parallel review",
    description:
      "Three specialized agents — security, performance, and code quality — run simultaneously on every PR. No waiting for one to finish before the next starts.",
    gif: "/blocks/5126d0dd14d2d73718fca5687d21edc3.gif",
  },
  {
    name: "Inline diff comments",
    description:
      "AI posts review comments directly on specific lines in your PR diff, exactly like a senior engineer would. No separate report to dig through.",
    gif: "/blocks/14801949d0c8708b3547a15559c74da0.gif",
  },
  {
    name: "GitHub App integration",
    description:
      "Installs in 30 seconds via GitHub Marketplace. Reviews trigger automatically on every pull request with zero manual steps.",
    gif: "/blocks/19b189d6dfbeb0115bf155cfe6ff27a4.gif",
  },
  {
    name: "Unified PR dashboard",
    description:
      "See every open PR and its review status across all your repositories in a single view. Filter by repo, agent findings, or review state.",
    gif: "/blocks/6ae1e20eeb8d4976920a26f1729c013d.gif",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="border-t border-white/8">
      <div className="grid grid-cols-1 divide-y divide-white/8 md:grid-cols-2 md:divide-y-0">
        {features.map((feature, i) => (
          <div
            key={feature.name}
            className={`flex items-stretch border-white/8 ${
              i % 2 === 0 ? "md:border-r" : ""
            } ${i < 2 ? "border-b" : ""}`}
          >
            {/* GIF — left column, fixed width */}
            <div className="w-[160px] shrink-0 overflow-hidden border-r border-white/8">
              <Image
                src={feature.gif}
                alt={feature.name}
                width={160}
                height={180}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>

            {/* Text — right column */}
            <div className="flex flex-1 flex-col justify-center px-7 py-7">
              <p className="mb-1 text-[11px] text-[#555] select-none">[*]</p>
              <h3 className="mb-2 text-[14px] font-bold text-white leading-snug">
                {feature.name}
              </h3>
              <p className="text-[12px] leading-relaxed text-[#666]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
