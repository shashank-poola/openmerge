import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { docPages, findDocPage } from "@/components/docs/docs-nav";
import { AgentsPage } from "@/components/docs/pages/AgentsPage";
import { HowItWorksPage } from "@/components/docs/pages/HowItWorksPage";
import { QuickStartPage } from "@/components/docs/pages/QuickStartPage";
import { ReadingReviewsPage } from "@/components/docs/pages/ReadingReviewsPage";
import { RepositoriesPage } from "@/components/docs/pages/RepositoriesPage";
import { SelfHostingPage } from "@/components/docs/pages/SelfHostingPage";
import { TroubleshootingPage } from "@/components/docs/pages/TroubleshootingPage";

const pages: Record<string, ComponentType> = {
  "quick-start": QuickStartPage,
  "how-it-works": HowItWorksPage,
  agents: AgentsPage,
  "reading-reviews": ReadingReviewsPage,
  repositories: RepositoriesPage,
  troubleshooting: TroubleshootingPage,
  "self-hosting": SelfHostingPage,
};

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return docPages.filter((page) => page.slug).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findDocPage((await params).slug);
  return page ? { title: `${page.title} · OpenMerge Docs`, description: page.description } : {};
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const Page = pages[slug];
  if (!Page) notFound();
  return <Page />;
}
