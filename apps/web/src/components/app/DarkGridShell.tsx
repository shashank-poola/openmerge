type DarkGridShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function DarkGridShell({ children, className = "" }: DarkGridShellProps) {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-[#040505] font-sans text-white ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:60px_60px] opacity-45" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#040505] via-[#040505]/90 to-transparent backdrop-blur-md" />
      {children}
    </main>
  );
}
