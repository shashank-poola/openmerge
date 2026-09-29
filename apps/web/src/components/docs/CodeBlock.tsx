"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useClipboard } from "@/hooks/useClipboard";

export function CodeBlock({ code, language, title }: { code: string; language?: string; title?: string }) {
  const { copied, copy } = useClipboard();

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#ebebe8] bg-[#fafaf9]">
      <div className="flex items-center justify-between border-b border-[#ebebe8] px-4 py-2">
        <span className="font-[family-name:var(--font-geist-mono)] text-[11.5px] text-[#8a8a85]">{title ?? language ?? "text"}</span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] text-[#6b6b67] transition-colors hover:bg-[#efefed] hover:text-[#171717]"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={13} strokeWidth={1.8} aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-[family-name:var(--font-geist-mono)] text-[13px] leading-6 text-[#2b2b29]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
