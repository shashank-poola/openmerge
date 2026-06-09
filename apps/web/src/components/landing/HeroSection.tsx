import { InstallTabs } from "./InstallTabs";

export function HeroSection() {
  return (
    <section className="px-10 pb-0 pt-14">
      {/* announcement bar */}
      <div className="mb-8 flex items-center gap-3 text-[14px]">
        <span className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-black">
          New
        </span>
        <span className="text-[#777]">
          Multi-agent parallel PR reviews now available.{" "}
          <a
            href="#features"
            className="relative text-white after:absolute after:bottom-[-1px] after:left-0
              after:h-[1px] after:w-0 after:bg-white after:transition-[width] after:duration-200
              hover:after:w-full"
          >
            Learn more
          </a>
        </span>
      </div>

      {/* headline */}
      <h1 className="mb-5 text-[40px] font-bold leading-tight tracking-tight text-white md:text-[52px]">
        The AI-powered GitHub
        <br />
        PR reviewer.
      </h1>

      <p className="mb-10 max-w-[500px] text-[15px] leading-relaxed text-[#777]">
        Installs as a GitHub App in seconds. Runs security, performance, and code quality
        agents on every pull request. Posts inline comments automatically.
      </p>

      <InstallTabs />

      {/* video placeholder */}
      <div className="mt-12 flex min-h-[380px] items-center justify-center border border-dashed border-white/8">
        <span className="select-none text-[12px] text-[#1e1c1c]">[ demo video ]</span>
      </div>
    </section>
  );
}
