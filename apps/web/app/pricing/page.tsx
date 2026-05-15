"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pricingFaqs = [
  {
    q: "Is there a free trial?",
    a: "Yes. The Cloud plan comes with a 14-day free trial — no credit card required. You can review up to 50 PRs during the trial with full access to all features.",
  },
  {
    q: "What happens when I exceed my review limit?",
    a: "On the Cloud plan, additional reviews are billed at $0.50 per review. You'll receive an email notification when you reach 80% of your limit. Enterprise plans have custom limits.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades take effect at the start of the next billing cycle.",
  },
  {
    q: "Do you offer discounts for startups?",
    a: "Yes! We offer 50% off for early-stage startups (under $1M ARR). Contact us with your company details to apply. We also offer 100% off for verified open source projects.",
  },
  {
    q: "How does per-seat pricing work?",
    a: "A seat is any developer who opens, reviews, or is assigned to pull requests in connected repositories. Seats are counted monthly and billed accordingly.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and ACH bank transfers. Enterprise customers can also pay by invoice with net-30 terms.",
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

export default function PricingPage() {
  return (
    <div className="bg-[#EAF0EF] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-6 border border-[#0A0A0A] inline-block px-3 py-1">
            PRICING
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#0A0A0A] mb-6">
            SIMPLE PRICING
          </h1>
          <p className="text-sm text-[#4D4D4D] tracking-wide max-w-lg mx-auto">
            Invest in code quality, not in complexity
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0A0A0A]">

            {/* Free */}
            <div className="p-8 border-r border-[#0A0A0A] flex flex-col">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-4">
                  FREE
                </p>
                <p className="text-5xl font-bold text-[#0A0A0A] mb-1">$0</p>
                <p className="text-xs text-[#4D4D4D] tracking-wide mb-8">forever</p>
                <ul className="space-y-3 mb-10">
                  {[
                    "10 reviews/month",
                    "1 repo",
                    "Public repos only",
                    "Community support",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#0A0A0A] text-xs mt-0.5">✓</span>
                      <span className="text-sm text-[#4D4D4D]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#signup"
                className="block w-full text-center border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#0A0A0A] hover:text-[#EAF0EF] transition-colors"
              >
                Get Started Free
              </a>
            </div>

            {/* Cloud */}
            <div className="p-8 border-r border-[#0A0A0A] flex flex-col bg-[#0A0A0A]">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#EAF0EF]">
                    CLOUD
                  </p>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#EAF0EF] border border-[#EAF0EF] px-2 py-0.5 opacity-60">
                    POPULAR
                  </span>
                </div>
                <p className="text-5xl font-bold text-[#EAF0EF] mb-1">$29</p>
                <p className="text-xs text-[#EAF0EF] tracking-wide opacity-60 mb-8">
                  per seat / month
                </p>
                <ul className="space-y-3 mb-10">
                  {[
                    "Unlimited repos",
                    "50 reviews/seat/month",
                    "Custom rules",
                    "All 50+ languages",
                    "PR summaries",
                    "Email + chat support",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#EAF0EF] text-xs mt-0.5">✓</span>
                      <span className="text-sm text-[#EAF0EF] opacity-80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#signup"
                className="block w-full text-center bg-[#EAF0EF] text-[#0A0A0A] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#4D4D4D] hover:text-[#EAF0EF] transition-colors"
              >
                Start Free Trial
              </a>
            </div>

            {/* Enterprise */}
            <div className="p-8 flex flex-col">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-4">
                  ENTERPRISE
                </p>
                <p className="text-5xl font-bold text-[#0A0A0A] mb-1">Custom</p>
                <p className="text-xs text-[#4D4D4D] tracking-wide mb-8">
                  contact us for pricing
                </p>
                <ul className="space-y-3 mb-10">
                  {[
                    "Self-hosted deployment",
                    "SSO / SAML",
                    "GitHub Enterprise",
                    "GitLab Self-Managed",
                    "Dedicated Slack support",
                    "Custom DPA",
                    "SLA guarantees",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#0A0A0A] text-xs mt-0.5">✓</span>
                      <span className="text-sm text-[#4D4D4D]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#enterprise-sales"
                className="block w-full text-center border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#0A0A0A] hover:text-[#EAF0EF] transition-colors"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-10">
            SPECIAL OFFERS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0A0A0A]">
            <div className="p-8 border-r border-[#0A0A0A]">
              <p className="text-2xl font-bold text-[#0A0A0A] mb-3">100% off</p>
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-3">
                FOR OPEN SOURCE PROJECTS
              </p>
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                Free Cloud plan access for verified open source projects. Apply with your GitHub organization.
              </p>
              <a
                href="#oss"
                className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] hover:text-[#4D4D4D] transition-colors"
              >
                Apply now →
              </a>
            </div>
            <div className="p-8">
              <p className="text-2xl font-bold text-[#0A0A0A] mb-3">50% off</p>
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-3">
                FOR EARLY-STAGE STARTUPS
              </p>
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                Half-price Cloud plan for startups under $1M ARR. Grow with PullRabbit from day one.
              </p>
              <a
                href="#startup"
                className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] hover:text-[#4D4D4D] transition-colors"
              >
                Apply now →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            PRICING FAQ
          </p>
          <div className="max-w-3xl border-t border-[#0A0A0A]">
            {pricingFaqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
