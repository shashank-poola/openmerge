import type { Installation, Repo, Review } from "@/src/lib/api";

export const demoUser = {
  name: "Shashank Poola",
  login: "shashank-poola",
  avatar: "https://github.com/github.png",
};

export const demoInstallations: Installation[] = [
  {
    id: "personal",
    accountLogin: "Shashank Poola",
    accountAvatarUrl: demoUser.avatar,
    accountType: "User",
  },
];

export const demoRepos: Repo[] = [
  { id: "assignments", name: "assignments", fullName: "shashank-poola/assignments", autoReviewEnabled: true },
  { id: "opennote", name: "OpenNote", fullName: "shashank-poola/OpenNote", autoReviewEnabled: true },
  { id: "pullrabbit", name: "pullrabbit", fullName: "shashank-poola/pullrabbit", autoReviewEnabled: false },
  { id: "urltoqr", name: "URLtoQR", fullName: "shashank-poola/URLtoQR", autoReviewEnabled: false },
  { id: "valuemycar", name: "valuemycar", fullName: "shashank-poola/valuemycar", autoReviewEnabled: false },
  { id: "activepieces", name: "activepieces", fullName: "shashank-poola/activepieces", autoReviewEnabled: false },
  { id: "agentos", name: "AgentOS", fullName: "shashank-poola/AgentOS", autoReviewEnabled: false },
];

export const demoReviews: Review[] = [
  {
    id: "1",
    prNumber: 1432,
    status: "NEEDS_REVIEW",
    totalComments: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    repository: { id: "pullrabbit", fullName: "shashank-poola/pullrabbit", owner: "shashank-poola", name: "pullrabbit" },
  },
  {
    id: "2",
    prNumber: 87,
    status: "RETURNED",
    totalComments: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 185).toISOString(),
    repository: { id: "opennote", fullName: "shashank-poola/OpenNote", owner: "shashank-poola", name: "OpenNote" },
  },
  {
    id: "3",
    prNumber: 51,
    status: "APPROVED",
    totalComments: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    repository: { id: "assignments", fullName: "shashank-poola/assignments", owner: "shashank-poola", name: "assignments" },
  },
];
