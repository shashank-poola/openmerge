export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative mx-auto min-h-screen max-w-[900px] border-x border-white/8">
        {children}
      </div>
    </div>
  );
}
