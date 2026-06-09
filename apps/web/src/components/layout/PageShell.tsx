export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#131010] text-white font-mono">
      <div className="relative mx-auto min-h-screen max-w-[1100px] border-x border-white/8">
        {children}
      </div>
    </div>
  );
}
