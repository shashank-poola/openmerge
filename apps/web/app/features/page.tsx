import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FeaturesPage() {
  return (
    <div className="bg-[#EAF0EF] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-8 border border-[#0A0A0A] inline-block px-3 py-1">
            FEATURES
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0A0A0A] leading-tight max-w-3xl">
            EVERYTHING YOU NEED FOR GREAT CODE REVIEWS
          </h1>
        </div>
      </section>

      {/* Feature 1: Inline Comments */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-6">
                FEATURE 01
              </p>
              <h2 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-6">
                INLINE COMMENTS
              </h2>
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                Context-aware PR comments that catch bugs, security issues, and anti-patterns. PullRabbit doesn&apos;t just read the diff — it understands the full context of your codebase before commenting.
              </p>
              <ul className="space-y-3">
                {[
                  "Pinpoints exact lines with actionable suggestions",
                  "Detects security vulnerabilities and CVEs",
                  "Flags anti-patterns specific to your stack",
                  "Links to relevant documentation and examples",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#0A0A0A] text-xs mt-0.5">✓</span>
                    <span className="text-sm text-[#4D4D4D]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Code snippet mockup */}
            <div className="border border-[#0A0A0A] bg-[#EAF0EF]">
              <div className="border-b border-[#0A0A0A] px-4 py-2 flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  auth/middleware.ts
                </span>
              </div>
              <div className="p-4 font-mono text-xs">
                <div className="flex gap-3">
                  <div className="text-[#4D4D4D] select-none text-right w-6 flex-shrink-0">
                    <div>42</div>
                    <div>43</div>
                    <div>44</div>
                    <div>45</div>
                    <div>46</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[#4D4D4D]">const token = req.headers.authorization;</div>
                    <div className="text-[#4D4D4D]">if (!token) return res.status(401);</div>
                    <div className="bg-red-50 border-l-2 border-red-400 pl-2 text-[#0A0A0A]">
                      const user = jwt.verify(token, SECRET);
                    </div>
                    <div className="text-[#4D4D4D]">req.user = user;</div>
                    <div className="text-[#4D4D4D]">next();</div>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#0A0A0A] p-4 bg-[#f5faf9]">
                <div className="flex items-start gap-3">
                  <span className="text-xs">🐇</span>
                  <div>
                    <p className="text-xs font-bold text-[#0A0A0A] mb-1">PullRabbit</p>
                    <p className="text-xs text-[#4D4D4D] leading-relaxed">
                      <strong className="text-red-600">Security:</strong> jwt.verify() here doesn&apos;t handle expired tokens — it will throw an error rather than returning null. Wrap in try/catch and handle TokenExpiredError explicitly. See your existing pattern in <code className="bg-[#EAF0EF] px-1">utils/auth.ts:18</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Custom Rules */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Rules mockup */}
            <div className="border border-[#0A0A0A] order-2 md:order-1">
              <div className="border-b border-[#0A0A0A] px-4 py-2">
                <span className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  Custom Rules — backend/
                </span>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {
                    rule: "All database queries must use parameterized statements",
                    scope: "src/db/**",
                  },
                  {
                    rule: "API endpoints must have rate limiting middleware",
                    scope: "src/routes/**",
                  },
                  {
                    rule: "Never log sensitive fields: password, token, secret",
                    scope: "**/*.ts",
                  },
                ].map((r, i) => (
                  <div key={i} className="border border-[#0A0A0A] p-4">
                    <p className="text-xs text-[#0A0A0A] mb-2">{r.rule}</p>
                    <p className="text-xs text-[#4D4D4D] font-mono">scope: {r.scope}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-6">
                FEATURE 02
              </p>
              <h2 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-6">
                CUSTOM RULES
              </h2>
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                Define your team&apos;s coding standards in plain English. No regex, no plugins. Just describe what you want enforced and PullRabbit handles the rest.
              </p>
              <ul className="space-y-3">
                {[
                  "Write rules in natural language",
                  "Scope to specific repos, paths, or file patterns",
                  "Override or silence rules per PR",
                  "Share rules across your organization",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#0A0A0A] text-xs mt-0.5">✓</span>
                    <span className="text-sm text-[#4D4D4D]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: PR Summaries */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-6">
                FEATURE 03
              </p>
              <h2 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-6">
                PR SUMMARIES
              </h2>
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                Auto-generated PR summaries with file-by-file breakdowns and confidence scores. Reviewers get context instantly — no more reading 500-line diffs to understand intent.
              </p>
              <ul className="space-y-3">
                {[
                  "Plain English summary of what changed and why",
                  "File-by-file breakdown with change type labels",
                  "Risk score and review priority signal",
                  "Auto-posted as PR description on open",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#0A0A0A] text-xs mt-0.5">✓</span>
                    <span className="text-sm text-[#4D4D4D]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Summary mockup */}
            <div className="border border-[#0A0A0A]">
              <div className="border-b border-[#0A0A0A] px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  PR Summary
                </span>
                <span className="text-xs border border-[#0A0A0A] px-2 py-0.5 text-[#0A0A0A] font-bold">
                  RISK: LOW
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs text-[#0A0A0A] leading-relaxed mb-5">
                  Adds rate limiting middleware to all public API routes using the existing Redis client. Refactors 3 auth helpers for consistency. No schema changes.
                </p>
                <div className="space-y-2">
                  {[
                    { file: "src/middleware/rateLimit.ts", label: "NEW", color: "text-green-700" },
                    { file: "src/routes/api.ts", label: "MODIFIED", color: "text-yellow-700" },
                    { file: "src/utils/auth.ts", label: "REFACTOR", color: "text-blue-700" },
                  ].map((f) => (
                    <div key={f.file} className="flex items-center justify-between border border-[#0A0A0A] px-3 py-2">
                      <span className="text-xs font-mono text-[#4D4D4D]">{f.file}</span>
                      <span className={`text-xs font-bold ${f.color}`}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Continuous Learning */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Learning mockup */}
            <div className="border border-[#0A0A0A] order-2 md:order-1">
              <div className="border-b border-[#0A0A0A] px-4 py-2">
                <span className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  Team Feedback Signal
                </span>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { type: "👍 Resolved", count: "142 comments resolved", desc: "Team agreed with PullRabbit" },
                  { type: "👎 Dismissed", count: "12 comments dismissed", desc: "PullRabbit learning to skip these" },
                  { type: "✏️ Custom", count: "8 rules added this month", desc: "From team corrections" },
                ].map((item) => (
                  <div key={item.type} className="border border-[#0A0A0A] p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#0A0A0A]">{item.type}</span>
                      <span className="text-xs font-bold text-[#0A0A0A]">{item.count}</span>
                    </div>
                    <p className="text-xs text-[#4D4D4D]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-6">
                FEATURE 04
              </p>
              <h2 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-6">
                CONTINUOUS LEARNING
              </h2>
              <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                PullRabbit learns from your team&apos;s feedback and reactions to improve reviews over time. The more your team interacts, the more accurate and relevant the reviews become.
              </p>
              <ul className="space-y-3">
                {[
                  "Learns from resolved and dismissed comments",
                  "Adapts to your team's preferences",
                  "Improves signal-to-noise ratio over time",
                  "Per-team and per-repo learning profiles",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#0A0A0A] text-xs mt-0.5">✓</span>
                    <span className="text-sm text-[#4D4D4D]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Full Codebase Context */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-6">
            WHAT MAKES US DIFFERENT
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight mb-8 max-w-2xl leading-tight">
            FULL CODEBASE CONTEXT
          </h2>
          <p className="text-sm text-[#4D4D4D] leading-relaxed mb-12 max-w-2xl">
            Builds a complete understanding of your entire codebase across 50+ languages. PullRabbit indexes your repo once and keeps it updated — so every review has the full picture, not just the diff.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0A0A0A]">
            {[
              { stat: "50+", label: "programming languages" },
              { stat: "< 5 min", label: "to index a new repo" },
              { stat: "Real-time", label: "index updates on push" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`p-8 text-center ${i < 2 ? "border-r border-[#0A0A0A]" : ""}`}
              >
                <p className="text-3xl font-bold text-[#0A0A0A] mb-2">{item.stat}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            RESULTS THAT SPEAK FOR THEMSELVES
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#0A0A0A]">
            {[
              { stat: "8.3×", label: "faster review turnaround" },
              { stat: "87%", label: "fewer bugs in production" },
              { stat: "500+", label: "engineering teams" },
              { stat: "2M+", label: "PRs reviewed" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`p-8 text-center ${i < 3 ? "border-r border-[#0A0A0A]" : ""}`}
              >
                <p className="text-3xl font-bold text-[#0A0A0A] mb-2">{item.stat}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-bold tracking-widest uppercase text-[#4D4D4D] mb-12">
            ENTERPRISE-GRADE SECURITY
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0A0A0A]">
            {[
              { title: "SOC 2 TYPE II", desc: "Audited annually. Available upon request under NDA." },
              { title: "SELF-HOSTED", desc: "Deploy PullRabbit in your own VPC. Your code never leaves your infrastructure." },
              { title: "NO TRAINING", desc: "Your code is never used to train AI models. Zero data retention after analysis." },
              { title: "END-TO-END ENCRYPTION", desc: "All data encrypted in transit (TLS 1.3) and at rest (AES-256)." },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`p-8 border-[#0A0A0A] ${
                  i === 0 ? "border-b border-r" :
                  i === 1 ? "border-b" :
                  i === 2 ? "border-r" : ""
                }`}
              >
                <p className="text-xs font-bold tracking-widest uppercase text-[#0A0A0A] mb-3">
                  {item.title}
                </p>
                <p className="text-sm text-[#4D4D4D] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight mb-6">
            READY TO SHIP BETTER CODE?
          </h2>
          <p className="text-sm text-[#4D4D4D] mb-10 tracking-wide">
            Set up in under 5 minutes. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#signup"
              className="bg-[#0A0A0A] text-[#EAF0EF] px-8 py-4 text-sm font-bold tracking-wider hover:bg-[#4D4D4D] transition-colors"
            >
              Try For Free →
            </a>
            <a
              href="/pricing"
              className="border border-[#0A0A0A] text-[#0A0A0A] px-8 py-4 text-sm font-bold tracking-wider hover:bg-[#0A0A0A] hover:text-[#EAF0EF] transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
