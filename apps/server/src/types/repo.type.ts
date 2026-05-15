export const githubRepo = (repo: {
    id: string;
    installationId: string;
    githubRepoId: bigint;
    owner: string;
    name: string;
    fullName: string;
    defaultBranch: string;
    isPrivate: boolean;
    isActive: boolean;
    autoReviewEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}) => ({
    ...repo,
    githubRepoId: repo.githubRepoId.toString(),
});
