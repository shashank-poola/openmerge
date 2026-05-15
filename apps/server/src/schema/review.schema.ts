import { z } from "zod";

export const reviewSessionSchema = z.object({
    repositoryId: z.string().uuid(),
    prNumber: z.number().int().positive(),
    headSha: z.string().nullable().optional(),
    baseBranch: z.string().default("main"),
    status: z.enum(["QUEUED", "RUNNING", "COMPLETED", "FAILED"]).default("QUEUED"),
    summary: z.string().nullable().optional(),
    filesReviewed: z.number().int().min(0).default(0),
    totalComments: z.number().int().min(0).default(0),
    githubReviewId: z.coerce.bigint().nullable().optional(),
    errorMessage: z.string().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
});
