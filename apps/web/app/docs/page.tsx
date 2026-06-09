export const metadata = { title: "Introduction — PullRabbit Docs" };

const toc = [
  { id: "overview", label: "Overview" },
  { id: "key-capabilities", label: "Key capabilities" },
  { id: "how-it-works", label: "How PullRabbit Works" },
  { id: "installation", label: "Installation" },
  { id: "configuration", label: "Configuration" },
];

export default function DocsIntroPage() {
  return (
    <div className="flex">
      {/* main prose */}
      <article className="min-w-0 flex-1 px-12 py-8 text-[13px] leading-relaxed">
        <p className="mb-2 text-[11px] font-bold text-[#e74c3c] tracking-wider uppercase">
          Getting Started
        </p>
        <h1 className="mb-4 text-[28px] font-bold leading-tight text-white">
          Introduction
        </h1>
        <p className="mb-6 text-[#888]">
          PullRabbit is an AI-powered GitHub PR reviewer. Install it as a GitHub App,
          and it automatically reviews every pull request using three specialized agents.
        </p>

        <h2 id="overview" className="mb-3 mt-8 text-[18px] font-bold text-white scroll-mt-16">
          Overview
        </h2>
        <p className="mb-4 text-[#888]">
          PullRabbit connects to your GitHub repositories via a GitHub App and reviews
          pull requests automatically. When a PR is opened, PullRabbit runs security,
          performance, and code quality agents in parallel, then posts inline comments
          directly on the diff — exactly like a senior engineer would.
        </p>

        <h2 id="key-capabilities" className="mb-3 mt-8 text-[18px] font-bold text-white scroll-mt-16">
          Key capabilities
        </h2>
        <ul className="mb-4 space-y-2 text-[#888]">
          {[
            ["Multi-agent parallel review:", "Three specialized agents run simultaneously on every PR — no sequential bottleneck."],
            ["Inline diff comments:", "AI findings are posted as line-level review comments, not a separate report."],
            ["GitHub App integration:", "Installs in 30 seconds. Webhooks trigger reviews automatically on every PR."],
            ["Unified dashboard:", "See every open PR and its review status across all your repositories."],
            ["Configurable rules:", "Ignore paths, adjust severity thresholds, and disable specific agents per repository."],
          ].map(([label, desc]) => (
            <li key={label as string} className="flex gap-2">
              <span className="shrink-0 text-[#444]">•</span>
              <span>
                <span className="font-bold text-white">{label}</span>{" "}
                {desc}
              </span>
            </li>
          ))}
        </ul>

        <h2 id="how-it-works" className="mb-3 mt-8 text-[18px] font-bold text-white scroll-mt-16">
          How PullRabbit Works
        </h2>
        <p className="mb-3 text-[#888]">
          When a pull request is opened or updated, GitHub sends a webhook to PullRabbit.
          The server validates the signature, creates a review job, and queues it for the worker.
        </p>
        <p className="mb-3 text-[#888]">
          The worker dequeues the job and runs three agents in parallel:
        </p>
        <ul className="mb-4 space-y-2 text-[#888]">
          {[
            "The Code Quality Agent checks for bugs, dead code, naming issues, and style violations.",
            "The Security Agent scans for injection risks, exposed secrets, insecure dependencies, and OWASP top 10 patterns.",
            "The Performance Agent identifies N+1 queries, unnecessary allocations, and algorithmic complexity issues.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="shrink-0 text-[#444]">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mb-4 text-[#888]">
          After all agents complete, findings are aggregated and posted as inline comments
          on the PR diff via the PullRabbit bot account.
        </p>

        <h2 id="installation" className="mb-3 mt-8 text-[18px] font-bold text-white scroll-mt-16">
          Installation
        </h2>
        <p className="mb-3 text-[#888]">Install the PullRabbit GitHub App in three steps:</p>
        <ol className="mb-4 space-y-2 text-[#888]">
          {[
            "Sign in at pullrabbit.dev with your GitHub account.",
            "Authorize PullRabbit and select the repositories to review.",
            "Open a pull request — PullRabbit will post a review automatically.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 font-bold text-white">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="my-5 border border-white/8 bg-[#0f0d0d] px-5 py-4 text-[12px]">
          <p className="mb-1 text-[10px] font-bold uppercase text-[#555]">bash</p>
          <code className="text-white"># No CLI install required — install via GitHub Marketplace</code>
          <br />
          <code className="text-[#81c995]">https://github.com/apps/pullrabbit</code>
        </div>

        <h2 id="configuration" className="mb-3 mt-8 text-[18px] font-bold text-white scroll-mt-16">
          Configuration
        </h2>
        <p className="mb-3 text-[#888]">
          Add a <code className="rounded border border-white/8 bg-[#1a1818] px-1.5 py-0.5">.pullrabbit.yml</code> file
          to the root of your repository to configure review behavior:
        </p>
        <div className="my-5 border border-white/8 bg-[#0f0d0d] px-5 py-4 text-[12px]">
          <p className="mb-1 text-[10px] font-bold uppercase text-[#555]">yaml</p>
          <pre className="text-white">{`agents:
  code_quality: true
  security: true
  performance: true

ignore:
  - "**/*.test.ts"
  - "migrations/**"
  - "*.generated.*"

severity_threshold: warning`}</pre>
        </div>
        <p className="text-[#888]">
          See the{" "}
          <a href="/docs/agents" className="text-white underline underline-offset-2 hover:no-underline">
            Agents & Rules
          </a>{" "}
          page for all available configuration options.
        </p>
      </article>

      {/* on this page */}
      <aside className="sticky top-12 h-[calc(100vh-3rem)] w-[180px] shrink-0 overflow-y-auto border-l border-white/8 px-4 py-8">
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-[#888]">
          <span className="text-[10px]">□</span>
          On this page
        </p>
        <nav className="space-y-1 text-[11px]">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block py-0.5 text-[#555] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
