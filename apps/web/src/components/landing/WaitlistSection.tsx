"use client";

import { useState } from "react";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="border-t border-white/8 px-10 py-24">
      <h2 className="mb-2 text-[18px] font-bold text-white">
        Be the first to know when we release new features
      </h2>
      <p className="mb-8 text-[14px] text-[#777]">Join the waitlist for early access.</p>

      {submitted ? (
        <p className="text-[14px] text-[#777]">You&apos;re on the list. We&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-[500px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="flex-1 border border-white/15 bg-transparent px-4 py-3 text-[13px] text-white placeholder-[#444] outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="border border-l-0 border-white/15 bg-white px-6 py-3 text-[13px] font-bold text-black transition-colors hover:bg-[#e8e8e8]"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
