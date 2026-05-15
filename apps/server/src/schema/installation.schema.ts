import { z } from "zod";

export const installationSchema = z.object({
    userId: z.string().uuid(),
    githubInstallationId: z.coerce.bigint(),
    githubAccountId: z.coerce.bigint(),
    githubAccountLogin: z.string().min(1).max(100),
    githubAccountType: z.string().min(1),
    status: z.enum(["ACTIVE", "SUSPENDED", "REMOVED"]).default("ACTIVE"),
    isPersonalAccount: z.boolean().default(false),
});
