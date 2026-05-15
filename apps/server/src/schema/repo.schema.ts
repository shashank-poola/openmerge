import { z } from "zod";

export const repoSchema = z.object({
    installationId: z.string().uuid(),
    githubRepoId: z.coerce.bigint(),
    owner: z.string().min(1).max(100),
    name: z.string().min(1).max(100),
    fullName: z.string().min(1).max(200),
    defaultBranch: z.string().min(1).max(100),
    isPrivate: z.boolean(),
    isActive: z.boolean().default(true),
    autoReviewEnabled: z.boolean().default(true),
});
