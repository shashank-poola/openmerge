import { z } from "zod";

export const userSchema = z.object({
    githubUserId: z.coerce.bigint(),
    githubLogin: z.string().min(1).max(100),
    email: z.string().email().nullable(),
    name: z.string().min(1).max(120).nullable().optional(),
    avatarUrl: z.string().url().refine((url) => {
        const protocol = new URL(url).protocol;
        return protocol === "http:" || protocol === "https:";
    }, "Avatar URL must use http or https").nullable().optional(),
  });