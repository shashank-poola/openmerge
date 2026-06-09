const reviewFiles = [
  { name: "src/review-agent.ts", added: 18 },
  { name: "src/github/webhook.ts", added: 31 },
  { name: "packages/db/schema.ts", added: 7 },
];

const workspaces = ["1. Review API route", "2. Check security", "3. Draft summary"];

export function ProductMockup() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-white/10 bg-[#0d0d0d] shadow-[0_0_80px_rgba(255,255,255,0.04)]">
      <div className="grid min-h-[330px] grid-cols-1 lg:grid-cols-[300px_1fr_400px]">
        <aside className="hidden border-r border-white/8 bg-[#111] lg:block">
          <WindowControls />
          <div className="px-4 py-4">
            <div className="mb-5 text-[16px] font-bold text-white">Reviews</div>
            <div className="mb-3 flex items-center justify-between text-[12px] font-bold text-[#555]">
              <span>Agents</span>
              <span>+</span>
            </div>
            <div className="space-y-1.5">
              {workspaces.map((item, index) => (
                <div
                  key={item}
                  className={`flex h-9 items-center justify-between rounded px-3 text-[14px] ${
                    index === 0
                      ? "bg-white/10 text-white"
                      : "text-[#555]"
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-[11px] text-[#2ec36b]">ready</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-[#0d0d0d]">
          <div className="flex h-[48px] items-center gap-4 border-b border-white/8 px-5 text-[14px] font-bold text-white">
            <span>Quickstart</span>
            <span className="text-[#444]">&gt;</span>
            <span className="text-[#888]">1. Start here</span>
          </div>
          <div className="flex h-[40px] items-center gap-6 border-b border-white/8 px-5 text-[13px] text-[#555]">
            <span className="border-b border-white pb-3 text-white">Start here</span>
            <span>App.tsx</span>
            <span>Terminal</span>
          </div>
          <div className="space-y-5 px-6 py-5 text-[14px] leading-7 md:px-8">
            <p className="font-bold text-white">
              PullRabbit runs AI review agents in parallel. Each agent checks one
              concern in its own workspace, then reports a clean reviewable diff.
            </p>
            <ol className="space-y-1 text-[#888]">
              <li>1. Connect a repository.</li>
              <li>2. Open a pull request.</li>
              <li>3. Review the suggested fixes before you merge.</li>
            </ol>
            <div className="rounded border border-white/8 bg-white/[0.03] p-4 text-[13px] text-[#888]">
              <span className="text-[#2ec36b]">PASS</span>{" "}
              security, performance, and code quality agents completed in 42s.
            </div>
          </div>
        </section>

        <aside className="border-t border-white/8 bg-[#0a0a0a] lg:border-l lg:border-t-0">
          <div className="flex h-[48px] items-center justify-between border-b border-white/8 px-5">
            <div className="flex items-center gap-3 text-[13px] font-bold text-[#2ec36b]">
              <span className="rounded border border-[#1a4d2e] bg-[#0d2b18] px-2.5 py-1 text-[12px]">
                PR #1432
              </span>
              <span>Ready for review</span>
            </div>
            <button className="rounded border border-white/10 px-3 py-1.5 text-[12px] text-[#888] hover:text-white transition-colors">
              Open PR
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="mb-3 grid grid-cols-4 gap-1 text-[12px] font-bold text-[#555]">
              <span>All files</span>
              <span className="rounded bg-white/8 px-2 py-1.5 text-center text-white">Changes 3</span>
              <span>Checks</span>
              <span className="text-right text-white">Review</span>
            </div>
            <div className="space-y-1.5">
              {reviewFiles.map((file, index) => (
                <div
                  key={file.name}
                  className={`flex h-9 items-center justify-between rounded px-3 text-[13px] ${
                    index === 0 ? "bg-white/8 text-white" : "text-[#555]"
                  }`}
                >
                  <span>{file.name}</span>
                  <span className="text-[#2ec36b]">+{file.added}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WindowControls() {
  return (
    <div className="flex h-[48px] items-center gap-2 px-4">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}
