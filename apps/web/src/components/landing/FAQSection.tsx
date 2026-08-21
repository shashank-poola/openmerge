"use client";

import { useState } from "react";

const faqs = [
  { question: "What is OpenMerge?", answer: "OpenMerge is an open source AI-powered GitHub App that runs parallel review agents on every pull request and posts inline comments on security, performance, and code quality issues." },
  { question: "How do I install OpenMerge?", answer: "Install the CLI via npm, bun, or brew — or install the GitHub App directly from GitHub Marketplace. Setup takes under 30 seconds." },
  { question: "Does OpenMerge need repository access?", answer: "Yes — only for the repositories you select during setup. You control which repos OpenMerge can access at all times." },
  { question: "Which AI models does OpenMerge support?", answer: "OpenMerge works with Claude, GPT-4o, Gemini, and any other LLM provider. Configure your preferred model in settings." },
  { question: "How long does a PR review take?", answer: "Most reviews complete in under 60 seconds. Security, performance, and code quality agents run in parallel to keep things fast." },
  { question: "How much does OpenMerge cost?", answer: "OpenMerge is free for open source repositories. Paid plans are available for private repositories and teams." },
  { question: "What about data and privacy?", answer: "Only your PR diff and relevant code context is sent to the AI model you configure. No data is stored permanently beyond your review session." },
  { question: "Is OpenMerge open source?", answer: "Yes. OpenMerge is fully open source on GitHub under the MIT license." },
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
              className="flex w-full items-center justify-between py-5 text-left text-[14px]
                text-white transition-colors duration-150 hover:text-white/70"
            >
              <span>{faq.question}</span>
              <span
                className={`ml-4 shrink-0 text-[18px] leading-none text-[#444]
                  transition-transform duration-200 ${open === i ? "rotate-45" : "rotate-0"}`}
              >
                +
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="pb-5 text-[13px] leading-relaxed text-[#777]">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
