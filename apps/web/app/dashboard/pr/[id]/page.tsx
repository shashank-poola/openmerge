'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Icons ────────────────────────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const pr = {
  id: '1',
  title: 'feat: add rate limiting to API endpoints',
  repo: 'api-server',
  branch: 'feat/rate-limiting',
  base: 'main',
  author: 'alex',
  createdAt: '2 hours ago',
  summary: `This PR adds rate limiting middleware to all public API endpoints using a token bucket algorithm. The implementation uses Redis for distributed rate limit state, allowing consistent enforcement across multiple server instances.`,
  keyChanges: [
    'Added RateLimiter class with configurable token bucket parameters',
    'Integrated Redis-backed storage for distributed rate limit state',
    'Applied middleware to all public routes in router.ts',
    'Added X-RateLimit-* response headers per RFC 6585',
    'Exposed /admin/rate-limits endpoint for dynamic config updates',
  ],
  riskLevel: 'medium' as const,
};

const findings = [
  {
    severity: 'critical',
    emoji: '🔴',
    color: 'text-git-red',
    message: 'SQL injection risk in user input handler',
    file: 'src/middleware/rate-limiter.ts:47',
  },
  {
    severity: 'warning',
    emoji: '🟡',
    color: 'text-git-yellow',
    message: 'Missing error handling in async function',
    file: 'src/routes/admin.ts:23',
  },
  {
    severity: 'suggestion',
    emoji: '🟢',
    color: 'text-git-green',
    message: 'Consider extracting this into a utility function',
    file: 'src/middleware/rate-limiter.ts:89',
  },
];

const diffFiles = [
  { name: 'src/middleware/rate-limiter.ts', additions: 87, deletions: 3 },
  { name: 'src/routes/router.ts', additions: 12, deletions: 2 },
  { name: 'src/routes/admin.ts', additions: 31, deletions: 0 },
];

const diffLines = [
  { type: 'context', n: 1, content: "import { Redis } from 'ioredis';" },
  { type: 'context', n: 2, content: "import { Request, Response, NextFunction } from 'express';" },
  { type: 'context', n: 3, content: '' },
  { type: 'added', n: 4, content: "const WINDOW_MS = 60_000;" },
  { type: 'added', n: 5, content: "const MAX_REQUESTS = 100;" },
  { type: 'context', n: 6, content: '' },
  { type: 'context', n: 7, content: "export class RateLimiter {" },
  { type: 'removed', n: 8, content: "  private store: Map<string, number> = new Map();" },
  { type: 'added', n: 9, content: "  private redis: Redis;" },
  { type: 'context', n: 10, content: '' },
  { type: 'added', n: 11, content: "  constructor(redis: Redis) {" },
  { type: 'added', n: 12, content: "    this.redis = redis;" },
  { type: 'added', n: 13, content: "  }" },
  { type: 'context', n: 14, content: '' },
  { type: 'context', n: 15, content: "  async check(key: string): Promise<boolean> {" },
  { type: 'removed', n: 16, content: "    return !this.store.has(key);" },
  { type: 'added', n: 17, content: "    const count = await this.redis.incr(key);" },
  { type: 'added', n: 18, content: "    if (count === 1) await this.redis.pexpire(key, WINDOW_MS);" },
  { type: 'added', n: 19, content: "    return count <= MAX_REQUESTS;" },
  { type: 'context', n: 20, content: "  }" },
];

const aiComment = {
  afterLine: 17,
  severity: 'warning',
  emoji: '⚠️',
  text: 'Race condition possible between',
  code: 'incr',
  rest: ' and ',
  code2: 'pexpire',
  rest2: '. Consider using a Lua script or',
  code3: 'SET key 1 PX ms NX',
  rest3: ' for atomicity.',
};

const riskColors: Record<string, string> = {
  low: 'border-git-green text-git-green',
  medium: 'border-git-yellow text-git-yellow',
  high: 'border-git-red text-git-red',
};

// ── Chat state ────────────────────────────────────────────────────────────────

const initialMessages = [
  { role: 'assistant', content: 'Hi! I\'ve reviewed this PR. Ask me anything about the changes.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PRReviewPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'diff' | 'chat'>('summary');
  const [expandedFile, setExpandedFile] = useState<string | null>(diffFiles[0].name);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: input.trim() },
      { role: 'assistant', content: 'Good question. Based on the diff, this change appears safe — the Redis connection is already validated at startup, so null checks are redundant here.' },
    ]);
    setInput('');
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Center panel */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-border">
        {/* Topbar breadcrumb */}
        <div className="flex h-14 shrink-0 items-center gap-1.5 border-b border-border px-5">
          <BranchIcon />
          <Link href="/dashboard" className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
            api-server
          </Link>
          <ChevronRight />
          <span className="font-mono text-xs text-muted-foreground">feat/rate-limiting</span>
          <ChevronRight />
          <span className="truncate text-sm text-foreground">{pr.title}</span>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-border px-5">
          {(['summary', 'diff', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Summary */}
          {activeTab === 'summary' && (
            <div className="p-6 space-y-6">
              {/* AI summary card */}
              <div className="rounded-lg border border-border bg-muted p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    AI Summary
                  </span>
                  <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider ${riskColors[pr.riskLevel]}`}>
                    {pr.riskLevel} risk
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{pr.summary}</p>
              </div>

              {/* Key changes */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Key Changes
                </h3>
                <ul className="space-y-2">
                  {pr.keyChanges.map((change, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-1 shrink-0 font-mono text-xs text-muted-foreground">—</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Diff */}
          {activeTab === 'diff' && (
            <div className="flex min-h-0 h-full">
              {/* File tree */}
              <div className="w-52 shrink-0 border-r border-border overflow-y-auto py-3">
                <p className="px-3 mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Files</p>
                {diffFiles.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setExpandedFile(f.name)}
                    className={`w-full px-3 py-1.5 text-left transition-colors hover:bg-muted/40 ${
                      expandedFile === f.name ? 'bg-muted/40' : ''
                    }`}
                  >
                    <p className="truncate font-mono text-xs text-foreground">
                      {f.name.split('/').pop()}
                    </p>
                    <p className="font-mono text-xs">
                      <span className="text-git-green">+{f.additions}</span>
                      <span className="mx-1 text-muted-foreground/40">/</span>
                      <span className="text-git-red">-{f.deletions}</span>
                    </p>
                  </button>
                ))}
              </div>

              {/* Diff viewer */}
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-3 font-mono text-xs text-muted-foreground">
                  {expandedFile}
                </div>
                <div className="overflow-hidden rounded-lg border border-border font-mono text-xs">
                  {diffLines.map((line, idx) => {
                    const isAdded = line.type === 'added';
                    const isRemoved = line.type === 'removed';
                    return (
                      <>
                        <div
                          key={`line-${idx}`}
                          style={{
                            backgroundColor: isAdded
                              ? 'var(--git-new-line-bg)'
                              : isRemoved
                              ? 'var(--git-removed-line-bg)'
                              : undefined,
                          }}
                          className="flex"
                        >
                          <span className="w-10 shrink-0 select-none border-r border-border px-2 py-0.5 text-right text-muted-foreground">
                            {line.n}
                          </span>
                          <span
                            className={`w-5 shrink-0 select-none px-1 py-0.5 ${
                              isAdded ? 'text-git-green' : isRemoved ? 'text-git-red' : 'text-muted-foreground/40'
                            }`}
                          >
                            {isAdded ? '+' : isRemoved ? '-' : ' '}
                          </span>
                          <span
                            className={`flex-1 py-0.5 pr-4 ${
                              isAdded ? 'text-git-green' : isRemoved ? 'text-git-red' : 'text-foreground'
                            }`}
                          >
                            {line.content}
                          </span>
                        </div>
                        {line.n === aiComment.afterLine && (
                          <div key={`comment-${idx}`} className="mx-3 my-2 rounded-md border border-border bg-muted p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <span className="text-sm">{aiComment.emoji}</span>
                              <span className="font-mono text-xs font-medium uppercase tracking-wider text-git-yellow">
                                {aiComment.severity}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">{aiComment.file}</span>
                            </div>
                            <p className="text-xs text-foreground">
                              {aiComment.text}{' '}
                              <code className="rounded bg-background px-1 font-mono">{aiComment.code}</code>
                              {aiComment.rest}
                              <code className="rounded bg-background px-1 font-mono">{aiComment.code2}</code>
                              {aiComment.rest2}{' '}
                              <code className="rounded bg-background px-1 font-mono">{aiComment.code3}</code>
                              {aiComment.rest3}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 p-5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground border border-border'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="shrink-0 border-t border-border p-4">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this PR…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SendIcon />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-border">
        {/* PR metadata */}
        <div className="border-b border-border p-5 space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            PR Metadata
          </h3>
          <dl className="space-y-2">
            {[
              { label: 'branch', value: pr.branch },
              { label: 'base', value: pr.base },
              { label: 'author', value: pr.author },
              { label: 'opened', value: pr.createdAt },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                <dd className="font-mono text-xs text-foreground truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* AI Findings */}
        <div className="flex-1 p-5 space-y-3">
          <span className="inline-flex items-center rounded-sm border border-tip-secondary-border bg-tip-secondary px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-tip-muted">
            AI Findings
          </span>

          <ul className="space-y-3 mt-3">
            {findings.map((f, i) => (
              <li key={i} className="rounded-md border border-border bg-muted/50 p-3">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-sm">{f.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">{f.message}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{f.file}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="shrink-0 space-y-2 border-t border-border p-5">
          <button className="w-full rounded-md bg-primary px-4 py-2 font-medium text-sm text-primary-foreground transition-colors hover:bg-primary/90">
            Approve
          </button>
          <button className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2 font-medium text-sm text-foreground transition-colors hover:bg-white/10">
            Request Changes
          </button>
        </div>
      </div>
    </div>
  );
}
