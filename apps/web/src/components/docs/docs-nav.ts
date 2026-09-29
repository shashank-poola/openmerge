export type DocPage = {
  slug: string;
  href: string;
  title: string;
  description: string;
};

export type DocGroup = {
  title: string;
  pages: DocPage[];
};

function page(slug: string, title: string, description: string): DocPage {
  return { slug, href: slug ? `/docs/${slug}` : "/docs", title, description };
}

export const docGroups: DocGroup[] = [
  {
    title: "Getting started",
    pages: [
      page("", "Introduction", "What OpenMerge is, what it reviews, and what it does not do."),
      page("quick-start", "Quick start", "Install the GitHub App and get your first review in a few minutes."),
    ],
  },
  {
    title: "Concepts",
    pages: [
      page("how-it-works", "How a review works", "The five stages every pull request goes through, from webhook to verdict."),
      page("agents", "Agents and severity", "What each specialist agent looks for, and how findings are ranked."),
      page("reading-reviews", "Reading a review", "The summary, the verdict, inline findings, and review statuses."),
    ],
  },
  {
    title: "Using OpenMerge",
    pages: [
      page("repositories", "Managing repositories", "Add repositories, pause automatic review, and re-run a review."),
      page("troubleshooting", "Troubleshooting", "What to check when a review does not appear or needs attention."),
    ],
  },
  {
    title: "Operate",
    pages: [page("self-hosting", "Self-hosting", "Run the web app, API, and worker yourself.")],
  },
];

export const docPages = docGroups.flatMap((group) => group.pages.map((page) => ({ ...page, group: group.title })));

export function findDocPage(slug: string) {
  return docPages.find((page) => page.slug === slug);
}

export function adjacentDocPages(slug: string) {
  const index = docPages.findIndex((page) => page.slug === slug);
  return {
    previous: index > 0 ? docPages[index - 1] : null,
    next: index >= 0 && index < docPages.length - 1 ? docPages[index + 1] : null,
  };
}

export const GITHUB_REPO_URL = "https://github.com/shashank-poola/openmerge";
export const GITHUB_APP_URL = "https://github.com/apps/openmerge-app/installations/select_target";
