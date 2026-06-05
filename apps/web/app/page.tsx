import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm font-mono">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-2" aria-label="Revue home">
            <LogoIcon />
            <span className="text-foreground text-base tracking-tight">revue</span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Site">
            <Link href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              docs
            </Link>
            <Link href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              changelog
            </Link>
            <Link
              href="https://github.com"
              className="flex items-center gap-1.5 text-sm text-foreground/70 transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
              github
            </Link>
          </nav>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center gap-2 rounded-md bg-foreground px-3 py-2 font-mono text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Install CLI
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          AI reviews your PRs before your team does.
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          Line-by-line suggestions, security flags, and context-aware feedback. Runs in your CI pipeline.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-between gap-2 rounded-md bg-foreground px-4 font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Install CLI
            <ArrowRight />
          </Link>
          <Link
            href="/dashboard/pr/1"
            className="inline-flex h-10 items-center justify-between gap-2 rounded-md border border-white/15 bg-white/5 px-4 font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            See a sample review
            <ArrowRight />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-2xl px-6 pb-32">
        <div className="mb-10 flex justify-center">
          <span className="inline-flex items-center rounded-sm border border-tip-secondary-border bg-tip-secondary px-2 py-1 font-mono text-xs font-medium uppercase tracking-wider text-tip-muted">
            How it works
          </span>
        </div>

        <ol className="space-y-8">
          {[
            {
              n: '01',
              title: 'Connect your repo.',
              desc: 'Install the Revue GitHub App in seconds. Works with any public or private repository.',
            },
            {
              n: '02',
              title: 'Push a PR.',
              desc: 'Revue picks it up instantly from your CI. No configuration needed after install.',
            },
            {
              n: '03',
              title: 'Get a review.',
              desc: 'Inline comments, risk score, and a full summary — posted to your PR within seconds.',
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-6">
              <span className="mt-0.5 shrink-0 font-mono text-sm text-muted-foreground">
                {step.n}
              </span>
              <div>
                <p className="mb-1 font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-6 py-10 font-mono">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-8 md:grid-cols-3">
            <div>
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                [product]
              </p>
              <ul className="space-y-2">
                {['docs', 'changelog', 'status'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                [legal]
              </p>
              <ul className="space-y-2">
                {['privacy', 'terms', 'security'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                [connect]
              </p>
              <ul className="space-y-2">
                {['github', 'twitter', 'email'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <LogoIcon />
              <span className="text-sm text-muted-foreground">revue ai</span>
            </div>
            <span className="text-xs text-muted-foreground">© 2026 Revue AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
