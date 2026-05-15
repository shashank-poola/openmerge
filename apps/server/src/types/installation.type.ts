export const githubInstallation = (installation: {
    id: string;
    userId: string;
    githubInstallationId: bigint;
    githubAccountId: bigint;
    githubAccountLogin: string;
    githubAccountType: string;
    status: "ACTIVE" | "SUSPENDED" | "REMOVED";
    isPersonalAccount: boolean;
    createdAt: Date;
    updatedAt: Date;
}) => ({
    ...installation,
    githubInstallationId: installation.githubInstallationId.toString(),
    githubAccountId: installation.githubAccountId.toString(),
});
