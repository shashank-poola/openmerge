'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoIcon, Wordmark } from './Logo';

const repos = [
  { id: 'api-server', name: 'api-server', emoji: '🔧', prs: 3 },
  { id: 'frontend', name: 'frontend', emoji: '⚡', prs: 1 },
  { id: 'ml-pipeline', name: 'ml-pipeline', emoji: '🧠', prs: 2 },
  { id: 'mobile', name: 'mobile', emoji: '📱', prs: 1 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon />
          <Wordmark />
        </Link>
      </div>

      {/* Repos section */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-2 px-2 py-1">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-sidebar-muted-foreground">
            Repositories
          </span>
        </div>

        <ul className="space-y-0.5">
          {repos.map((repo, i) => {
            const isActive = i === 0;
            return (
              <li key={repo.id}>
                <Link
                  href="/dashboard"
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent ${
                    isActive ? 'bg-sidebar-accent' : ''
                  }`}
                >
                  <span className="text-sm">{repo.emoji}</span>
                  <span
                    className={`flex-1 truncate font-mono text-sm ${
                      isActive ? 'text-sidebar-foreground' : 'text-sidebar-muted-foreground'
                    }`}
                  >
                    {repo.name}
                  </span>
                  <span className="font-mono text-xs text-sidebar-muted-foreground">
                    {repo.prs}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <span className="font-mono text-xs text-sidebar-muted-foreground">
          revue ai · v0.1.0
        </span>
      </div>
    </aside>
  );
}
