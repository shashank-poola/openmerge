import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { adjacentDocPages, findDocPage, GITHUB_REPO_URL } from "./docs-nav";
import { DocHeader } from "./DocsPrimitives";
import { DocsToc, type TocItem } from "./DocsToc";

export function DocArticle({ slug, toc, children }: { slug: string; toc: TocItem[]; children: ReactNode }) {
  const page = findDocPage(slug);
  if (!page) return null;
  const { previous, next } = adjacentDocPages(slug);

  return (
    <div className="flex">
      <article className="min-w-0 flex-1 px-5 pb-20 pt-10 sm:px-10 lg:px-14 lg:pt-14">
        <div className="mx-auto max-w-[720px]">
          <DocHeader group={page.group} title={page.title} description={page.description} />
          <div className="pb-4">{children}</div>

          <nav className="mt-14 grid gap-3 border-t border-[#efefec] pt-8 sm:grid-cols-2" aria-label="Pagination">
            {previous ? (
              <Link href={previous.href} className="group rounded-xl border border-[#ebebe8] p-4 transition-colors hover:border-[#d6d6d2] hover:bg-[#fafaf9]">
                <span className="flex items-center gap-1.5 text-[12px] text-[#8a8a85]">
                  <HugeiconsIcon icon={ArrowLeft02Icon} size={13} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                  Previous
                </span>
                <span className="mt-1 block text-[14.5px] font-semibold text-[#171717]">{previous.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link href={next.href} className="group rounded-xl border border-[#ebebe8] p-4 text-right transition-colors hover:border-[#d6d6d2] hover:bg-[#fafaf9]">
                <span className="flex items-center justify-end gap-1.5 text-[12px] text-[#8a8a85]">
                  Next
                  <HugeiconsIcon icon={ArrowRight02Icon} size={13} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-[14.5px] font-semibold text-[#171717]">{next.title}</span>
              </Link>
            ) : null}
          </nav>

          <p className="mt-8 text-[12.5px] text-[#8a8a85]">
            Something unclear or out of date?{" "}
            <a href={`${GITHUB_REPO_URL}/issues/new`} target="_blank" rel="noreferrer" className="font-medium text-[#3f3f3c] underline decoration-[#d6d6d2] underline-offset-4 hover:text-[#171717]">
              Open an issue
            </a>
            .
          </p>
        </div>
      </article>

      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[232px] shrink-0 overflow-y-auto py-14 pr-6 xl:block">
        <DocsToc items={toc} />
      </aside>
    </div>
  );
}
