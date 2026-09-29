import { GeistMono } from "geist/font/mono";
import { DocsShell } from "@/components/docs/DocsShell";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={GeistMono.variable}>
      <DocsShell>{children}</DocsShell>
    </div>
  );
}
