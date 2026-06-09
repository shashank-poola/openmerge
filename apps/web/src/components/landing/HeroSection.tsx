import Image from "next/image";
import { InstallTabs } from "./InstallTabs";

export function HeroSection() {
  return (
    <section className="px-10 pb-0 pt-14">
      <div className="mb-8 flex items-center gap-3 text-[14px]">
        <span className="rounded border border-white/30 px-1.5 py-0.5 text-[11px] font-bold text-white">
          New
        </span>
        <span className="text-[#777]">
          Multi-agent parallel PR reviews now available.{" "}
          <a href="#features" className="text-white hover:underline underline-offset-2">
            Learn more
          </a>
        </span>
      </div>

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

      <div className="mt-12 border-t border-x-0 border-white/8 overflow-hidden">
        <Image
          src="/blocks/5126d0dd14d2d73718fca5687d21edc3.gif"
          alt="PullRabbit AI review in action"
          width={900}
          height={500}
          className="w-full"
          unoptimized
          priority
        />
      </div>
    </section>
  );
}
