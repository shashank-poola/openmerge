"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RAISED =
  "bg-gradient-to-b from-[#202020] to-[#191919] shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060]";

const INSET =
  "bg-[#0a0a0a] shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset] border border-white/5";

const faqs = [
  {
    q: "How much does PullRabbit cost?",
    a: "Our Cloud plan starts at $29/seat/month with a 14-day free trial — no credit card required. Free tier includes 10 reviews/month on a single repo. Enterprise pricing is custom.",
  },
  {
    q: "Can I self-host PullRabbit?",
    a: "Yes, our Enterprise plan supports fully self-hosted deployment. You get complete control over infrastructure, data residency, and security configuration.",
  },
  {
    q: "What languages are supported?",
    a: "PullRabbit supports 50+ languages: TypeScript, Python, Go, Rust, Java, C++, Ruby, PHP, Swift, Kotlin, and more. Our codebase indexing handles any language with standard syntax.",
  },
  {
    q: "Does PullRabbit work with GitLab?",
    a: "Yes — both GitHub and GitLab out of the box. GitHub Enterprise and GitLab Self-Managed on Enterprise. Bitbucket support coming soon.",
  },
  {
    q: "Is my code safe?",
    a: "SOC 2 Type II compliant. Your code is never used for training. All data encrypted at rest and in transit. Enterprise customers can opt for self-hosted for maximum control.",
  },
  {
    q: "How long does setup take?",
    a: "Under 5 minutes. Connect GitHub, select repos — PullRabbit starts reviewing your next PR immediately. Zero configuration required.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-bold text-[#e8e8e8] tracking-wide">{q}</span>
        <span className="text-[#444] text-lg shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="text-sm text-[#666] leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#0f0f0f] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-4xl">
            <p
              className={`text-xs font-bold tracking-widest uppercase text-[#555] mb-8 inline-block px-3 py-1 border border-white/10 ${RAISED}`}
            >
              AI AGENTS FOR PULL REQUESTS
            </p>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tight text-[#e8e8e8] leading-none mb-8">
              The AI PR<br />Reviewer
            </h1>
            <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-10 max-w-xl leading-relaxed">
              REVIEW PULL REQUESTS WITH FULL CONTEXT OF YOUR CODEBASE
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                onClick={() => signIn("github")}
                className="bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] text-[#0f0f0f] px-6 py-3 text-sm font-bold tracking-wider shadow-[0_1px_0.5px_#ffffff60_inset,0_2px_8px_#00000080] hover:from-[#f0f0f0] hover:to-[#d8d8d8] transition-all active:scale-[0.97]"
              >
                Start Free →
              </button>
              <a
                href="#features"
                className={`border border-white/10 text-[#888] px-6 py-3 text-sm font-bold tracking-wider hover:text-[#e8e8e8] transition-colors active:scale-[0.97] ${RAISED}`}
              >
                View Demo
              </a>
            </div>
            <p className="text-xs text-[#333] tracking-wide">
              no credit card required · 14-day free trial
            </p>
          </div>

          {/* Terminal preview */}
          <div className="mt-16 max-w-3xl">
            <div className={`rounded-sm overflow-hidden ${INSET}`}>
              <div
                className={`px-4 py-2.5 border-b border-white/5 flex items-center gap-2 ${RAISED}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a] shadow-[0_0.5px_0_#ffffff15_inset]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a] shadow-[0_0.5px_0_#ffffff15_inset]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a] shadow-[0_0.5px_0_#ffffff15_inset]" />
                <span className="text-xs text-[#333] tracking-widest ml-2 uppercase">
                  pullrabbit — pr #247
                </span>
              </div>
              <div className="p-6 space-y-2.5 font-mono text-xs">
                <p className="text-[#333]">$ pullrabbit review --pr 247</p>
                <p className="text-[#444]">→ Fetching codebase context...</p>
                <p className="text-[#444]">→ Analyzing 3 files changed (+142 −38)</p>
                <p className="text-[#444]">→ Indexing function calls and types...</p>
                <div className="h-px bg-white/5 my-3" />
                <p className="text-[#777]">
                  <span className="text-[#e8e8e8]">auth/middleware.ts:47</span> — SQL injection
                  risk in user query.
                </p>
                <p className="text-[#555] pl-4">
                  Parameterize: <span className="text-[#aaa]">db.query(sql, [userId])</span>
                </p>
                <p className="text-[#777] mt-1">
                  <span className="text-[#e8e8e8]">api/routes.ts:112</span> — Missing rate limit
                  on /upload.
                </p>
                <p className="text-[#555] pl-4">
                  Add{" "}
                  <span className="text-[#aaa]">
                    rateLimit({"{ max: 10, windowMs: 60000 }"})
                  </span>{" "}
                  middleware.
                </p>
                <div className="h-px bg-white/5 my-3" />
                <p className="text-[#444]">✓ Review complete. 2 issues, 1 suggestion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[#333] mb-8 text-center">
            500+ ENGINEERING TEAMS USE PULLRABBIT TO SHIP FASTER
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma", "Shopify"].map((company) => (
              <span
                key={company}
                className="text-sm font-bold tracking-widest uppercase text-[#2a2a2a] hover:text-[#555] transition-colors cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            WHAT PULLRABBIT DOES
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                num: "01",
                title: "INLINE COMMENTS",
                desc: "Context-aware PR comments that catch bugs, security issues, and anti-patterns with full codebase understanding.",
              },
              {
                num: "02",
                title: "CUSTOM RULES",
                desc: "Define your team's coding standards in plain English. Scoped to repos, file paths, or patterns.",
              },
              {
                num: "03",
                title: "PR SUMMARIES",
                desc: "Auto-generated PR summaries with file-by-file breakdowns and confidence scores.",
              },
              {
                num: "04",
                title: "CONTINUOUS LEARNING",
                desc: "PullRabbit learns from your team's feedback and reactions to improve reviews over time.",
              },
            ].map((feature) => (
              <div key={feature.title} className={`p-8 ${RAISED}`}>
                <p className="text-3xl font-bold text-white/5 mb-4">{feature.num}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#e8e8e8] mb-4">
                  {feature.title}
                </p>
                <p className="text-sm text-[#555] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            HOW PULLRABBIT WORKS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { num: "01", title: "CONNECT", desc: "Connect your GitHub or GitLab repo in under 2 minutes." },
              { num: "02", title: "REVIEW", desc: "PullRabbit analyzes every PR with full codebase context." },
              { num: "03", title: "IMPROVE", desc: "Get actionable feedback on every pull request, automatically." },
            ].map((step) => (
              <div key={step.num} className={`p-8 ${INSET}`}>
                <p className="text-4xl font-bold text-white/5 mb-4">{step.num}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#e8e8e8] mb-3">
                  {step.title}
                </p>
                <p className="text-sm text-[#555] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            DATA-DRIVEN RESULTS
          </p>
          <div className={`flex flex-col md:flex-row items-center gap-8 mb-10 p-10 ${RAISED}`}>
            <div className="text-center flex-1">
              <p className="text-6xl md:text-7xl font-bold text-[#333] line-through decoration-[#555]">
                20 hrs
              </p>
              <p className="text-xs font-bold tracking-widest uppercase text-[#333] mt-3">
                average review time without PullRabbit
              </p>
            </div>
            <div className="text-4xl font-bold text-[#2a2a2a] shrink-0">→</div>
            <div className="text-center flex-1">
              <p className="text-6xl md:text-7xl font-bold text-[#e8e8e8]">2.4 hrs</p>
              <p className="text-xs font-bold tracking-widest uppercase text-[#555] mt-3">
                average review time with PullRabbit
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { stat: "87%", label: "fewer bugs in production" },
              { stat: "3×", label: "faster code reviews" },
              { stat: "50+", label: "languages supported" },
            ].map((item) => (
              <div key={item.label} className={`p-8 text-center ${INSET}`}>
                <p className="text-4xl font-bold text-[#e8e8e8] mb-2">{item.stat}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#444]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            WHY PULLRABBIT
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-4 pr-8 text-xs font-bold tracking-widest uppercase text-[#444]">
                    FEATURE
                  </th>
                  <th
                    className={`py-4 px-6 text-xs font-bold tracking-widest uppercase text-[#e8e8e8] border-x border-white/5 ${RAISED}`}
                  >
                    PULLRABBIT
                  </th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-[#333]">
                    CODERABBIT
                  </th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-[#333]">
                    GREPTILE
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Codebase-aware reviews", pr: true, cr: false, gr: true },
                  { feature: "Custom rule engine", pr: true, cr: false, gr: false },
                  { feature: "Auto PR summaries", pr: true, cr: true, gr: false },
                  { feature: "Self-hosted option", pr: true, cr: false, gr: false },
                  { feature: "GitHub + GitLab", pr: true, cr: true, gr: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-4 pr-8 text-sm text-[#555]">{row.feature}</td>
                    <td className="py-4 px-6 text-center bg-[#141414] border-x border-white/5">
                      {row.pr ? (
                        <span className="text-[#e8e8e8] font-bold">✓</span>
                      ) : (
                        <span className="text-[#2a2a2a]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.cr ? (
                        <span className="text-[#444]">✓</span>
                      ) : (
                        <span className="text-[#2a2a2a]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.gr ? (
                        <span className="text-[#444]">✓</span>
                      ) : (
                        <span className="text-[#2a2a2a]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            TRUSTED BY ENGINEERING TEAMS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote:
                  "PullRabbit caught a critical security vulnerability in our auth service that our team missed in 3 rounds of review.",
                name: "Alex Chen",
                role: "CTO @ Buildspace",
              },
              {
                quote:
                  "The codebase context is what makes PullRabbit different. It doesn't review in isolation — it understands our entire system.",
                name: "Sarah Park",
                role: "VP Engineering @ Cascade",
              },
              {
                quote:
                  "We went from 2-day review cycles to same-day merges. PullRabbit handles the tedious parts so we focus on architecture.",
                name: "Marcus Webb",
                role: "Staff Engineer @ Meridian",
              },
            ].map((t) => (
              <div key={t.name} className={`p-8 flex flex-col justify-between ${RAISED}`}>
                <p className="text-sm text-[#666] leading-relaxed mb-8">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#e8e8e8]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#444] tracking-wide mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            SIMPLE, TRANSPARENT PRICING
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className={`p-8 ${INSET}`}>
              <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-2">CLOUD</p>
              <p className="text-4xl font-bold text-[#e8e8e8] mb-1">$29</p>
              <p className="text-xs text-[#333] tracking-wide mb-6">per seat / month</p>
              <ul className="space-y-2 mb-8">
                {["Unlimited repos", "50 reviews/seat", "Custom rules", "All languages"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#555] text-xs">✓</span>
                      <span className="text-sm text-[#555]">{item}</span>
                    </li>
                  )
                )}
              </ul>
              <button
                onClick={() => signIn("github")}
                className="block w-full text-center bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] text-[#0f0f0f] px-6 py-3 text-sm font-bold tracking-wider shadow-[0_1px_0.5px_#ffffff60_inset,0_2px_8px_#00000080] hover:from-[#f0f0f0] hover:to-[#d8d8d8] transition-all active:scale-[0.97]"
              >
                Start Free Trial
              </button>
            </div>
            <div className={`p-8 ${RAISED}`}>
              <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-2">
                ENTERPRISE
              </p>
              <p className="text-4xl font-bold text-[#e8e8e8] mb-1">Custom</p>
              <p className="text-xs text-[#333] tracking-wide mb-6">contact us for pricing</p>
              <ul className="space-y-2 mb-8">
                {["Self-hosted", "SSO / SAML", "Dedicated support", "Custom DPA"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#555] text-xs">✓</span>
                    <span className="text-sm text-[#555]">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#enterprise-sales"
                className="block w-full text-center border border-white/10 text-[#777] px-6 py-3 text-sm font-bold tracking-wider hover:text-[#e8e8e8] hover:border-white/20 transition-all active:scale-[0.97]"
              >
                Talk to Sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#444] mb-12">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <div className="max-w-3xl border-t border-white/5">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-[#e8e8e8] tracking-tight mb-6">
            START REVIEWING SMARTER
          </h2>
          <p className="text-sm text-[#444] mb-10 tracking-wide">
            Join 500+ engineering teams shipping better code with PullRabbit
          </p>
          <button
            onClick={() => signIn("github")}
            className="inline-block bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] text-[#0f0f0f] px-8 py-4 text-sm font-bold tracking-wider shadow-[0_1px_0.5px_#ffffff60_inset,0_2px_8px_#00000080] hover:from-[#f0f0f0] hover:to-[#d8d8d8] transition-all active:scale-[0.97] mb-6"
          >
            Try For Free →
          </button>
          <p className="text-xs text-[#2a2a2a] tracking-wide block">
            no credit card required · 14-day free trial
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
