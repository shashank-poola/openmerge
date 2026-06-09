"use client";

import { useState } from "react";

const tabs = [
  { id: "npm", label: "npm", command: "npm install -g pullrabbit" },
  { id: "bun", label: "bun", command: "bun add -g pullrabbit" },
  { id: "pnpm", label: "pnpm", command: "pnpm add -g pullrabbit" },
  { id: "brew", label: "brew", command: "brew install pullrabbit/tap/pullrabbit" },
];

export function InstallTabs() {
  const [activeTab, setActiveTab] = useState("npm");
  const [copied, setCopied] = useState(false);
  const activeCommand = tabs.find((t) => t.id === activeTab)?.command ?? "";

  const copy = () => {
    navigator.clipboard.writeText(activeCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[580px]">
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 pb-2.5 pt-1 text-[14px] transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-white text-white"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded border border-white/10 bg-white/[0.04] px-4 py-3">
        <code className="text-[14px] text-[#e8e8e8]">{activeCommand}</code>
        <button
          onClick={copy}
          className="ml-4 shrink-0 rounded px-2 py-1 text-[12px] text-[#555] transition-colors hover:text-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
