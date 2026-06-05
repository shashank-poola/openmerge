export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 40" width="20" height="28" className={className} aria-hidden="true">
      <rect x="2" y="2" width="6" height="36" rx="2" fill="#eae8e6" />
      <rect x="8" y="2" width="14" height="6" rx="2" fill="#eae8e6" />
      <rect x="22" y="8" width="6" height="10" rx="2" fill="#eae8e6" />
      <rect x="8" y="18" width="14" height="6" rx="2" fill="#eae8e6" />
      <rect x="14" y="26" width="6" height="6" rx="2" fill="#eae8e6" />
      <rect x="20" y="32" width="6" height="6" rx="2" fill="#eae8e6" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="font-mono text-foreground text-base font-normal tracking-tight">
      revue
    </span>
  );
}
