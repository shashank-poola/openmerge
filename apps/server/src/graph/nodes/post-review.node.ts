import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { db } from "@repo/database";
import { env } from "../../config/env.config";
import type { PRReviewStateType, AgentComment } from "../review.state";
import { cleanupRepo } from "../context/clone-repo";

const createInstallationOctokit = (githubInstallationId: string) =>
    new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            installationId: Number(githubInstallationId),
        },
    });

const SEVERITY_EMOJI: Record<AgentComment["severity"], string> = {
    CRITICAL: "🔴",
    HIGH: "🟠",
    MEDIUM: "🟡",
    LOW: "🔵",
    INFO: "⚪",
};

const SEVERITY_LABEL: Record<AgentComment["severity"], string> = {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
    INFO: "Info",
};

const CATEGORY_LABEL: Record<AgentComment["category"], string> = {
    BUG: "Bug",
    SECURITY: "Security",
    PERFORMANCE: "Performance",
    STYLE: "Style",
    REFACTOR: "Refactor",
    DOCUMENTATION: "Documentation",
    TEST: "Test",
    OTHER: "Other",
};

const formatCommentBody = (c: AgentComment): string => {
    const emoji = SEVERITY_EMOJI[c.severity];
    const severityLabel = SEVERITY_LABEL[c.severity];
    const categoryLabel = CATEGORY_LABEL[c.category];
    const blockingLabel = c.blocking === true ? "**blocking**" : "non-blocking";

    const lines: string[] = [
        `> ${emoji} **${severityLabel} · ${categoryLabel}** · ${blockingLabel}`,
        "",
        c.body,
    ];

    if (c.suggestion) {
        lines.push("", "**Suggested fix:**", "", "```", c.suggestion, "```");
    }

    lines.push("", "---", "*[PullRabbit](https://github.com/apps/pull-rabbit) · AI code review*");
    return lines.join("\n");
};

const buildWalkthroughSummary = (state: PRReviewStateType, comments: AgentComment[], durationMs: number): string => {
    const counts: Record<AgentComment["severity"], number> = {
        CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0,
    };
    for (const c of comments) counts[c.severity]++;

    const blockingCount = comments.filter((c) => c.blocking === true).length;
    const totalIssues = comments.length;

    const severityRows = (["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const)
        .filter((s) => counts[s] > 0)
        .map((s) => `| ${SEVERITY_EMOJI[s]} ${SEVERITY_LABEL[s]} | ${counts[s]} |`)
        .join("\n");

    const fileList = state.changedFiles
        .slice(0, 10)
        .map((f) => {
            const fileComments = comments.filter((c) => c.filePath === f || c.filePath.endsWith(f));
            const fileIssues = fileComments.length > 0 ? ` · ${fileComments.length} issue${fileComments.length > 1 ? "s" : ""}` : "";
            return `- \`${f}\`${fileIssues}`;
        })
        .join("\n");

    const moreFiles = state.changedFiles.length > 10 ? `\n- *...and ${state.changedFiles.length - 10} more files*` : "";

    const verdict = counts.CRITICAL > 0 || counts.HIGH > 0
        ? "⛔ **Changes requested** — blocking issues must be resolved before merging."
        : totalIssues > 0
            ? "⚠️ **Review comments posted** — non-blocking issues noted for your attention."
            : "✅ **Looks good!** — No issues found in this pull request.";

    const durationSec = (durationMs / 1000).toFixed(1);

    const lines = [
        "## 🐰 PullRabbit Review",
        "",
        verdict,
        "",
    ];

    if (state.changedFiles.length > 0) {
        lines.push("### Files reviewed");
        lines.push(fileList + moreFiles);
        lines.push("");
    }

    if (totalIssues > 0) {
        lines.push("### Issues found");
        lines.push("| Severity | Count |");
        lines.push("|----------|-------|");
        lines.push(severityRows);
        lines.push("");

        if (blockingCount > 0) {
            lines.push(`> 🚨 **${blockingCount} blocking issue${blockingCount > 1 ? "s" : ""} must be fixed before this PR can merge.**`);
            lines.push("");
        }
    }

    lines.push(`<sub>Reviewed ${state.changedFiles.length} file${state.changedFiles.length !== 1 ? "s" : ""} in ${durationSec}s · [PullRabbit](https://github.com/apps/pull-rabbit)</sub>`);

    return lines.join("\n");
};

const postWalkthrough = async (
    octokit: Octokit,
    state: PRReviewStateType,
    loadingCommentId: bigint | null,
    comments: AgentComment[],
    durationMs: number,
): Promise<void> => {
    const body = buildWalkthroughSummary(state, comments, durationMs);
    try {
        if (loadingCommentId) {
            await octokit.rest.issues.updateComment({
                owner: state.owner,
                repo: state.repoName,
                comment_id: Number(loadingCommentId),
                body,
            });
        } else {
            await octokit.rest.issues.createComment({
                owner: state.owner,
                repo: state.repoName,
                issue_number: state.prNumber,
                body,
            });
        }
    } catch {
        // best-effort
    }
};

export const postReview = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
    const startedAt = Date.now();
    const octokit = createInstallationOctokit(state.githubInstallationId);

    const session = await db.reviewSession.findUnique({
        where: { id: state.reviewSessionId },
        select: { githubLoadingCommentId: true, createdAt: true },
    });
    const loadingCommentId = session?.githubLoadingCommentId ?? null;
    const queuedAt = session?.createdAt ? session.createdAt.getTime() : startedAt;
    const totalDurationMs = Date.now() - queuedAt;

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
            if (loadingCommentId) {
                try {
                    await octokit.rest.issues.updateComment({
                        owner: state.owner,
                        repo: state.repoName,
                        comment_id: Number(loadingCommentId),
                        body: "**PullRabbit** encountered an error during review. Please try again or check the configuration.",
                    });
                } catch { /* best-effort */ }
            }
            return {};
        }

        const comments = state.allComments;

        // Always post the walkthrough summary (replaces loading comment)
        await postWalkthrough(octokit, state, loadingCommentId, comments, totalDurationMs);

        if (comments.length === 0) {
            await db.reviewSession.update({
                where: { id: state.reviewSessionId },
                data: { status: "COMPLETED", filesReviewed: state.changedFiles.length, totalComments: 0, completedAt: new Date() },
            });
            return {};
        }

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
