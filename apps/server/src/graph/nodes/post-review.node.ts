import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { db } from "@repo/database";
import { env } from "../../config/env.config";
import type { PRReviewStateType } from "../review.state";
import { cleanupRepo } from "../context/clone-repo";

const createInstallationOctokit = (githubInstallationId: string) => {
    return new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            installationId: Number(githubInstallationId),
        },
    });
};

export const postReview = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    try {
        await db.reviewSession.update({
            where: { id: state.reviewSessionId },
            data: { status: "RUNNING" },
        });

        if (state.error) {
            await db.reviewSession.update({
                where: { id: state.reviewSessionId },
                data: { status: "FAILED", errorMessage: state.error, completedAt: new Date() },
            });
            return {};
        }

        const comments = state.allComments;
        if (comments.length === 0) {
            await db.reviewSession.update({
                where: { id: state.reviewSessionId },
                data: { status: "COMPLETED", filesReviewed: state.changedFiles.length, totalComments: 0, completedAt: new Date() },
            });
            return {};
        }

        const octokit = createInstallationOctokit(state.githubInstallationId);

        const reviewRes = await octokit.rest.pulls.createReview({
            owner: state.owner,
            repo: state.repoName,
            pull_number: state.prNumber,
            commit_id: state.headSha,
            event: "COMMENT",
            comments: comments.map((c) => ({
                path: c.filePath,
                line: c.line,
                side: "RIGHT" as const,
                ...(c.startLine && c.startLine < c.line
                    ? { start_line: c.startLine, start_side: "RIGHT" as const }
                    : {}),
                body: formatCommentBody(c),
            })),
        });

        await db.reviewComment.createMany({
            data: comments.map((c) => ({
                reviewSessionId: state.reviewSessionId,
                filePath: c.filePath,
                line: c.line,
                startLine: c.startLine ?? null,
                body: c.body,
                severity: c.severity,
                category: c.category,
                suggestion: c.suggestion ?? null,
            })),
        });

        await db.reviewSession.update({
            where: { id: state.reviewSessionId },
            data: {
                status: "COMPLETED",
                filesReviewed: state.changedFiles.length,
                totalComments: comments.length,
                githubReviewId: BigInt(reviewRes.data.id),
                completedAt: new Date(),
            },
        });

        return {};
    } catch (err) {
        console.error("postReview failed:", err);
        await db.reviewSession.update({
            where: { id: state.reviewSessionId },
            data: { status: "FAILED", errorMessage: String(err), completedAt: new Date() },
        });
        return { error: String(err) };
    } finally {
        if (state.repoLocalPath) {
            await cleanupRepo(state.repoLocalPath);
        }
    }
};

const formatCommentBody = (c: PRReviewStateType["allComments"][number]): string => {
    const severityEmoji: Record<string, string> = {
        CRITICAL: "🔴",
        HIGH: "🟠",
        MEDIUM: "🟡",
        LOW: "🔵",
        INFO: "⚪",
    };
    const lines = [`${severityEmoji[c.severity] ?? ""} **[${c.severity}] ${c.category}**`, "", c.body];
    if (c.suggestion) lines.push("", `**Suggestion:** ${c.suggestion}`);
    lines.push("", "_— PullRabbit AI Review_");
    return lines.join("\n");
};
