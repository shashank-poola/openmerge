"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

export function DocsToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node));
    if (!headings.length) return;

    // A heading becomes active once it crosses the top third of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -66% 0px" }
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav aria-label="On this page">
      <p className="text-[12px] font-medium text-[#8a8a85]">On this page</p>
      <ul className="mt-3 space-y-0.5 border-l border-[#ececea]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "-ml-px block border-l py-1 pl-3 text-[13px] leading-5 transition-colors",
                activeId === item.id ? "border-[#171717] font-medium text-[#171717]" : "border-transparent text-[#6b6b67] hover:text-[#171717]"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
