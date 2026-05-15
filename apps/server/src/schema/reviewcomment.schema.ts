import { z } from "zod";

export const reviewCommentSchema = z.object({
    reviewSessionId: z.string().uuid(),
    filePath: z.string().min(1),
    line: z.number().int().positive(),
    startLine: z.number().int().positive().nullable().optional(),
    side: z.enum(["LEFT", "RIGHT"]).default("RIGHT"),
    startSide: z.enum(["LEFT", "RIGHT"]).nullable().optional(),
    title: z.string().max(200).nullable().optional(),
    body: z.string().min(1),
    severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]).default("MEDIUM"),
    category: z.enum(["BUG", "SECURITY", "PERFORMANCE", "STYLE", "REFACTOR", "DOCUMENTATION", "TEST", "OTHER"]).default("OTHER"),
    suggestion: z.string().nullable().optional(),
    githubCommentId: z.coerce.bigint().nullable().optional(),
});