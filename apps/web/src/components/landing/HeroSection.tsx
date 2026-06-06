import { ArrowRight, Download } from "@/components/landing/icons";
import { PixelTitle } from "@/components/landing/brand/PixelTitle";
import { ProductMockup } from "@/components/landing/ProductMockup";

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-[1512px] px-6 pb-16 pt-4 font-mono md:px-12 lg:px-[196px]">
      <div className="mx-auto max-w-[657px] lg:mx-0 lg:ml-[426px]">
        <a
          href="#"
          className="mb-7 inline-flex items-center gap-3 text-[16px] text-pr-ink transition-opacity hover:opacity-70"
        >
          See what is new in 0.6.2
          <ArrowRight className="h-5 w-5" />
        </a>

        <PixelTitle text="pullrabbit" />

        <div className="mt-8 space-y-4">
          <h1 className="text-[23px] font-bold leading-tight tracking-normal text-pr-ink">
            AI code review agents for every pull request.
          </h1>
          <p className="max-w-[650px] text-[16px] leading-[1.55] text-pr-copy">
            Create parallel review agents that inspect changes in isolated workspaces.
            See issues, suggestions, and merge readiness at a glance, then ship the
            PR with confidence.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-[312px_1fr] sm:items-center">
          <a
            href="/dashboard"
            className="flex h-[50px] items-center justify-between rounded-[6px] bg-pr-charcoal px-4 text-[16px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Download PullRabbit
            <Download className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="flex h-[50px] items-center justify-between px-3 text-[16px] text-pr-ink transition-opacity hover:opacity-70"
          >
            Learn how it works
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>

      <ProductMockup />
    </section>
  );
}
