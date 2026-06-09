"use client";

import { useState } from "react";
import { useClipboard } from "@/hooks/useClipboard";

const tabs = [
  { id: "npm",  label: "npm",  command: "npm install -g pullrabbit" },
  { id: "bun",  label: "bun",  command: "bun add -g pullrabbit" },
  { id: "pnpm", label: "pnpm", command: "pnpm add -g pullrabbit" },
  { id: "brew", label: "brew", command: "brew install pullrabbit/tap/pullrabbit" },
];

export function InstallTabs() {
  const [activeTab, setActiveTab] = useState("npm");
  const { copied, copy } = useClipboard();
  const activeCommand = tabs.find((t) => t.id === activeTab)?.command ?? "";

  return (
    <div className="w-full max-w-[580px]">
      {/* tabs */}
      <div className="flex border-b border-white/8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 pb-2.5 pt-1 text-[13px] transition-colors duration-150
              ${activeTab === tab.id ? "text-white" : "text-[#555] hover:text-[#999]"}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* command row */}
      <div className="mt-4 flex items-center justify-between border border-white/8 bg-white/[0.03] px-4 py-3
        transition-colors duration-150 hover:bg-white/[0.05]">
        <code className="text-[13px] text-[#e8e8e8] transition-all duration-150">
          {activeCommand}
        </code>
        <button
          onClick={() => copy(activeCommand)}
          className="ml-4 shrink-0 px-2 py-1 text-[11px] text-[#555] transition-colors duration-150 hover:text-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
