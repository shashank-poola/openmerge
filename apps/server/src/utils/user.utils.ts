import { db } from "@repo/database";

export const upsertUserFromGithubData = async (data: {
    githubUserId: bigint;
    githubLogin: string;
    email: string | null;
    name?: string | null;
    avatarUrl?: string | null;
}) => {
    return db.user.upsert({
        where: {
            githubLogin: data.githubLogin,
        },
        update: {
            githubUserId: data.githubUserId,
            email: data.email,
            name: data.name ?? null,
            avatarUrl: data.avatarUrl ?? null,
        },
        create: {
            githubUserId: data.githubUserId,
            githubLogin: data.githubLogin,
            email: data.email,
            name: data.name ?? null,
            avatarUrl: data.avatarUrl ?? null,
        },
    });
};