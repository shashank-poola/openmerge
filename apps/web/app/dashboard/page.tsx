import Link from 'next/link';

type PRStatus = 'open' | 'reviewing' | 'needs attention' | 'merged';

const prs: {
  id: string;
  title: string;
  author: string;
  status: PRStatus;
  files: number;
  time: string;
}[] = [
  { id: '1', title: 'feat: add rate limiting to API endpoints', author: 'alex', status: 'reviewing', files: 8, time: '2h ago' },
  { id: '2', title: 'fix: memory leak in websocket handler', author: 'sam', status: 'needs attention', files: 3, time: '4h ago' },
  { id: '3', title: 'refactor: migrate auth to JWT', author: 'jordan', status: 'open', files: 12, time: '1d ago' },
  { id: '4', title: 'feat: dark mode for mobile app', author: 'casey', status: 'merged', files: 24, time: '2d ago' },
  { id: '5', title: 'chore: upgrade dependencies', author: 'riley', status: 'open', files: 6, time: '3d ago' },
  { id: '6', title: 'fix: race condition in job queue', author: 'morgan', status: 'needs attention', files: 5, time: '3d ago' },
];

const statusStyles: Record<PRStatus, { color: string; label: string }> = {
  open: {
    color: 'border-muted-foreground text-muted-foreground',
    label: 'open',
  },
  reviewing: {
    color: 'border-git-blue text-git-blue',
    label: 'reviewing',
  },
  'needs attention': {
    color: 'border-git-yellow text-git-yellow',
    label: 'needs attention',
  },
  merged: {
    color: 'border-git-green text-git-green',
    label: 'merged',
  },
};

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

export default function DashboardPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-6">
        <BranchIcon />
        <span className="font-mono text-sm text-muted-foreground">api-server</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-mono text-sm text-foreground">main</span>
        <div className="ml-auto">
          <span className="font-mono text-xs text-muted-foreground">{prs.length} pull requests</span>
        </div>
      </div>

      {/* Table header */}
      <div className="border-b border-border px-6 py-2">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <span>title</span>
          <span className="w-32 text-right">status</span>
          <span className="w-16 text-right">files</span>
          <span className="w-20 text-right">opened</span>
        </div>
      </div>

      {/* PR list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {prs.map((pr) => {
          const s = statusStyles[pr.status];
          return (
            <Link
              key={pr.id}
              href={`/dashboard/pr/${pr.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 transition-colors hover:bg-muted/40 items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{pr.title}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  opened by {pr.author}
                </p>
              </div>
              <div className="w-32 flex justify-end">
                <span
                  className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider ${s.color}`}
                >
                  {s.label}
                </span>
              </div>
              <div className="w-16 text-right">
                <span className="font-mono text-xs text-muted-foreground">{pr.files} files</span>
              </div>
              <div className="w-20 text-right">
                <span className="font-mono text-xs text-muted-foreground">{pr.time}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
