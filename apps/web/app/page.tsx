"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "How much does PullRabbit cost?",
    a: "Our Cloud plan starts at $29/seat/month with a 14-day free trial — no credit card required. We also offer a free tier with 10 reviews/month and a single repo. Enterprise pricing is custom based on your team's needs.",
  },
  {
    q: "Can I self-host PullRabbit?",
    a: "Yes, our Enterprise plan supports fully self-hosted deployment. You get complete control over your infrastructure, data residency, and security configuration. Contact our sales team to get started.",
  },
  {
    q: "What languages are supported?",
    a: "PullRabbit supports 50+ programming languages including TypeScript, Python, Go, Rust, Java, C++, Ruby, PHP, Swift, Kotlin, and many more. Our codebase indexing handles any language with standard syntax.",
  },
  {
    q: "Does PullRabbit work with GitLab?",
    a: "Yes, PullRabbit supports both GitHub and GitLab out of the box. GitHub Enterprise and GitLab Self-Managed are available on the Enterprise plan. Bitbucket support is coming soon.",
  },
  {
    q: "Is my code safe?",
    a: "Absolutely. We are SOC 2 Type II compliant and your code is never used for training AI models. All data is encrypted at rest and in transit. Enterprise customers can opt for self-hosted deployment for maximum control.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams are up and running in under 5 minutes. Connect your GitHub or GitLab account, select repos, and PullRabbit immediately starts reviewing your next pull request. No configuration required to get started.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0A0A0A]">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-bold text-[#0A0A0A] tracking-wide">{q}</span>
        <span className="text-[#4D4D4D] text-lg flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="text-sm text-[#4D4D4D] leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#EAF0EF] min-h-screen">
      <Navbar />

      {/* Section 1: Hero */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-4xl">
            <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-8 border border-[#0A0A0A] inline-block px-3 py-1">
              AI AGENTS FOR PULL REQUESTS
            </p>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tight text-[#0A0A0A] leading-none mb-8">
              The AI PR Reviewer
            </h1>
            <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-10 max-w-xl leading-relaxed">
              REVIEW PULL REQUESTS WITH FULL CONTEXT OF YOUR CODEBASE
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <a
                href="#signup"
                className="bg-[#0A0A0A] text-[#EAF0EF] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#4D4D4D] transition-colors"
              >
                Try For Free →
              </a>
              <a
                href="#demo"
                className="border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#0A0A0A] hover:text-[#EAF0EF] transition-colors"
              >
                View Demo
              </a>
            </div>
            <p className="text-xs text-[#4D4D4D] tracking-wide">
              no credit card required · 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Social Proof */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-10 text-center">
            500+ ENGINEERING TEAMS USE PULLRABBIT TO SHIP FASTER
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma", "Shopify"].map((company) => (
              <span
                key={company}
                className="text-sm font-bold tracking-widest uppercase text-[#4D4D4D] opacity-60 hover:opacity-100 transition-opacity"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Features Grid */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            WHAT PULLRABBIT DOES
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0A0A0A]">
            {[
              {
                title: "INLINE COMMENTS",
                desc: "Context-aware PR comments that catch bugs, security issues, and anti-patterns with full codebase understanding.",
              },
              {
                title: "CUSTOM RULES",
                desc: "Define your team's coding standards in plain English. Scoped to repos, file paths, or patterns.",
              },
              {
                title: "PR SUMMARIES",
                desc: "Auto-generated PR summaries with file-by-file breakdowns and confidence scores.",
              },
              {
                title: "CONTINUOUS LEARNING",
                desc: "PullRabbit learns from your team's feedback and reactions to improve reviews over time.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`p-8 border-[#0A0A0A] ${
                  i === 0 ? "border-b border-r" :
                  i === 1 ? "border-b" :
                  i === 2 ? "border-r" : ""
                }`}
              >
                <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] mb-4">
                  {feature.title}
                </p>
                <p className="text-sm text-[#4D4D4D] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            HOW PULLRABBIT WORKS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0A0A0A]">
            {[
              {
                num: "01",
                title: "CONNECT",
                desc: "Connect your GitHub or GitLab repo in under 2 minutes.",
              },
              {
                num: "02",
                title: "REVIEW",
                desc: "PullRabbit analyzes every PR with full codebase context.",
              },
              {
                num: "03",
                title: "IMPROVE",
                desc: "Get actionable feedback on every pull request, automatically.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`p-8 ${i < 2 ? "border-r border-[#0A0A0A]" : ""}`}
              >
                <p className="text-4xl font-bold text-[#0A0A0A] opacity-10 mb-4">{step.num}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] mb-3">
                  {step.title}
                </p>
                <p className="text-sm text-[#4D4D4D] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Metrics */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            DATA-DRIVEN RESULTS
          </p>
          {/* Big stat comparison */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16 border border-[#0A0A0A] p-10">
            <div className="text-center flex-1">
              <p className="text-6xl md:text-7xl font-bold text-[#4D4D4D] line-through decoration-[#0A0A0A]">
                20 hrs
              </p>
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mt-3">
                average review time without PullRabbit
              </p>
            </div>
            <div className="text-4xl font-bold text-[#4D4D4D] flex-shrink-0">→</div>
            <div className="text-center flex-1">
              <p className="text-6xl md:text-7xl font-bold text-[#0A0A0A]">2.4 hrs</p>
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mt-3">
                average review time with PullRabbit
              </p>
            </div>
          </div>
          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0A0A0A]">
            {[
              { stat: "87%", label: "fewer bugs in production" },
              { stat: "3×", label: "faster code reviews" },
              { stat: "50+", label: "languages supported" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`p-8 text-center ${i < 2 ? "border-r border-[#0A0A0A]" : ""}`}
              >
                <p className="text-4xl font-bold text-[#0A0A0A] mb-2">{item.stat}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Security */}
      <section id="enterprise" className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            ENTERPRISE-GRADE SECURITY
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              {[
                "Self-hosted option available",
                "SOC 2 Type II Compliant",
                "Data never used for training",
                "End-to-end encrypted",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-[#0A0A0A] font-bold mt-0.5">✓</span>
                  <span className="text-sm text-[#4D4D4D] tracking-wide">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                Enterprise teams get dedicated support, custom security reviews, and flexible deployment options. We work with your security team to meet compliance requirements.
              </p>
              <a
                href="#enterprise-sales"
                className="inline-block border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#0A0A0A] hover:text-[#EAF0EF] transition-colors w-fit"
              >
                Talk to Enterprise Sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Testimonials */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            TRUSTED BY ENGINEERING TEAMS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0A0A0A]">
            {[
              {
                quote:
                  "PullRabbit caught a critical security vulnerability in our auth service that our team missed in 3 rounds of review.",
                name: "Alex Chen",
                role: "CTO @ Buildspace",
              },
              {
                quote:
                  "The codebase context is what makes PullRabbit different. It doesn't just review in isolation — it understands our entire system.",
                name: "Sarah Park",
                role: "VP Engineering @ Cascade",
              },
              {
                quote:
                  "We went from 2-day review cycles to same-day merges. PullRabbit handles the tedious parts so we can focus on architecture.",
                name: "Marcus Webb",
                role: "Staff Engineer @ Meridian",
              },
            ].map((t, i) => (
              <div
                key={t.name}
                className={`p-8 flex flex-col justify-between ${i < 2 ? "border-r border-[#0A0A0A]" : ""}`}
              >
                <p className="text-sm text-[#0A0A0A] leading-relaxed mb-8">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#4D4D4D] tracking-wide mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Pricing Teaser */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            SIMPLE, TRANSPARENT PRICING
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0A0A0A] mb-8">
            {/* Cloud */}
            <div className="p-8 border-r border-[#0A0A0A]">
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-2">
                CLOUD
              </p>
              <p className="text-4xl font-bold text-[#0A0A0A] mb-1">$29</p>
              <p className="text-xs text-[#4D4D4D] tracking-wide mb-6">per seat / month</p>
              <ul className="space-y-2 mb-8">
                {["Unlimited repos", "50 reviews/seat", "Custom rules", "All languages"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#0A0A0A] text-xs">✓</span>
                      <span className="text-sm text-[#4D4D4D]">{item}</span>
                    </li>
                  )
                )}
              </ul>
              <a
                href="#signup"
                className="block w-full text-center bg-[#0A0A0A] text-[#EAF0EF] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#4D4D4D] transition-colors"
              >
                Start Free Trial
              </a>
            </div>
            {/* Enterprise */}
            <div className="p-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-2">
                ENTERPRISE
              </p>
              <p className="text-4xl font-bold text-[#0A0A0A] mb-1">Custom</p>
              <p className="text-xs text-[#4D4D4D] tracking-wide mb-6">contact us for pricing</p>
              <ul className="space-y-2 mb-8">
                {["Self-hosted", "SSO / SAML", "Dedicated support", "Custom DPA"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#0A0A0A] text-xs">✓</span>
                      <span className="text-sm text-[#4D4D4D]">{item}</span>
                    </li>
                  )
                )}
              </ul>
              <a
                href="#enterprise-sales"
                className="block w-full text-center border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#0A0A0A] hover:text-[#EAF0EF] transition-colors"
              >
                Talk to Sales
              </a>
            </div>
          </div>
          <a
            href="/pricing"
            className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] hover:text-[#0A0A0A] transition-colors"
          >
            View full pricing →
          </a>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <div className="max-w-3xl border-t border-[#0A0A0A]">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 10: Final CTA */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-[#0A0A0A] tracking-tight mb-6">
            START REVIEWING SMARTER
          </h2>
          <p className="text-sm text-[#4D4D4D] mb-10 tracking-wide">
            Join 500+ engineering teams shipping better code with PullRabbit
          </p>
          <a
            href="#signup"
            className="inline-block bg-[#0A0A0A] text-[#EAF0EF] px-8 py-4 text-sm font-bold tracking-wider hover:bg-[#4D4D4D] transition-colors mb-6"
          >
            Try For Free →
          </a>
          <p className="text-xs text-[#4D4D4D] tracking-wide">
            no credit card required · 14-day free trial
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
