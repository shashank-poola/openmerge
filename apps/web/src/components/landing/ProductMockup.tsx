const reviewFiles = [
  { name: "src/review-agent.ts", added: 18 },
  { name: "src/github/webhook.ts", added: 31 },
  { name: "packages/db/schema.ts", added: 7 },
];

const workspaces = ["1. Review API route", "2. Check security", "3. Draft summary"];

export function ProductMockup() {
  return (
    <div className="mt-28 overflow-hidden rounded-[8px] border border-black/15 bg-[#151210] text-[#dad6d1] shadow-[0_0_42px_rgba(44,40,38,0.20)]">
      <div className="grid min-h-[330px] grid-cols-1 lg:grid-cols-[310px_1fr_420px]">
        <aside className="hidden border-r border-white/8 bg-[#1d1917] lg:block">
          <WindowControls />
          <div className="px-4 py-4">
            <div className="mb-5 text-[17px] font-bold text-[#d8d2cd]">History</div>
            <div className="mb-3 flex items-center justify-between text-[13px] font-bold text-[#89837d]">
              <span>Workspaces</span>
              <span>+ </span>
            </div>
            <div className="space-y-2">
              {workspaces.map((item, index) => (
                <div
                  key={item}
                  className={`flex h-10 items-center justify-between rounded-[6px] px-3 text-[15px] ${
                    index === 0 ? "bg-[#2b2622] text-[#e5dfda]" : "text-[#908984]"
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-[12px] text-[#2ec36b]">ready</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-[#161311]">
          <div className="flex h-[48px] items-center gap-4 border-b border-white/8 bg-[#211d1a] px-5 text-[15px] font-bold text-[#d7d1cc]">
            <span>Quickstart</span>
            <span className="text-[#766f69]">&gt;</span>
            <span>1. Start here</span>
          </div>
          <div className="flex h-[45px] items-center gap-6 border-b border-white/8 px-5 text-[13px] text-[#8f8882]">
            <span className="border-b border-[#f2eee9] pb-3 text-[#ded8d3]">Start here</span>
            <span>App.tsx</span>
            <span>Terminal</span>
          </div>
          <div className="space-y-5 px-6 py-5 text-[15px] leading-7 md:px-8">
            <p className="font-bold text-[#e8e1dc]">
              PullRabbit runs AI review agents in parallel. Each agent checks one
              concern in its own workspace, then reports a clean reviewable diff.
            </p>
            <ol className="space-y-1 text-[#cfc7c0]">
              <li>1. Connect a repository.</li>
              <li>2. Open a pull request.</li>
              <li>3. Review the suggested fixes before you merge.</li>
            </ol>
            <div className="rounded-[6px] border border-[#3c352f] bg-[#100e0d] p-4 text-[13px] text-[#9d968f]">
              <span className="text-[#59d98a]">PASS</span> security, performance,
              and code quality agents completed in 42s.
            </div>
          </div>
        </section>

        <aside className="border-t border-white/8 bg-[#100d0c] lg:border-l lg:border-t-0">
          <div className="flex h-[48px] items-center justify-between border-b border-white/8 px-5">
            <div className="flex items-center gap-4 text-[14px] font-bold text-[#10a957]">
              <span className="rounded-[5px] border border-[#0d6137] bg-[#083d24] px-3 py-1">
                PR #1432
              </span>
              <span>Ready for review</span>
            </div>
            <button className="rounded-[4px] bg-[#342d28] px-3 py-2 text-[12px] font-bold text-[#f0ece8]">
              Create PR
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="mb-3 grid grid-cols-4 text-[13px] font-bold text-[#827a74]">
              <span>All files</span>
              <span className="rounded-[5px] bg-[#2c2622] px-3 py-2 text-[#e2d9d3]">Changes 3</span>
              <span>Checks</span>
              <span className="text-right text-[#e2d9d3]">Review</span>
            </div>
            <div className="space-y-2">
              {reviewFiles.map((file, index) => (
                <div
                  key={file.name}
                  className={`flex h-9 items-center justify-between rounded-[5px] px-3 text-[13px] ${
                    index === 0 ? "bg-[#2b2622] text-[#d8d1cb]" : "text-[#a49b93]"
                  }`}
                >
                  <span>{file.name}</span>
                  <span className="text-[#4fe27b]">+{file.added}</span>
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
