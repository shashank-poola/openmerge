"use client";

import { useState } from "react";

const faqs = [
  { question: "What is PullRabbit?", answer: "PullRabbit is an open source AI-powered GitHub App that runs parallel review agents on every pull request and posts inline comments on security, performance, and code quality issues." },
  { question: "How do I install PullRabbit?", answer: "Install the CLI via npm, bun, or brew — or install the GitHub App directly from GitHub Marketplace. Setup takes under 30 seconds." },
  { question: "Does PullRabbit need repository access?", answer: "Yes — only for the repositories you select during setup. You control which repos PullRabbit can access at all times." },
  { question: "Which AI models does PullRabbit support?", answer: "PullRabbit works with Claude, GPT-4o, Gemini, and any other LLM provider. Configure your preferred model in settings." },
  { question: "How long does a PR review take?", answer: "Most reviews complete in under 60 seconds. Security, performance, and code quality agents run in parallel to keep things fast." },
  { question: "How much does PullRabbit cost?", answer: "PullRabbit is free for open source repositories. Paid plans are available for private repositories and teams." },
  { question: "What about data and privacy?", answer: "Only your PR diff and relevant code context is sent to the AI model you configure. No data is stored permanently beyond your review session." },
  { question: "Is PullRabbit open source?", answer: "Yes. PullRabbit is fully open source on GitHub under the MIT license." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-white/8 px-10 py-24">
      <h2 className="mb-12 text-[18px] font-bold text-white">FAQ</h2>
      <div className="max-w-[640px] divide-y divide-white/8">
        {faqs.map((faq, i) => (
          <div key={faq.question}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left text-[14px] text-white transition-colors hover:text-white/70"
            >
              <span>{faq.question}</span>
              <span className="ml-4 shrink-0 text-[#444] text-[18px] leading-none">
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && (
              <p className="pb-5 text-[13px] leading-relaxed text-[#777]">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
