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

const SECTION_ORDER: AgentComment["category"][] = [
    "BUG", "SECURITY", "PERFORMANCE", "REFACTOR", "STYLE", "DOCUMENTATION", "TEST", "OTHER",
];

const SEVERITY_RANK: Record<AgentComment["severity"], number> = {
    CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1,
};

const SEVERITY_EMOJI: Record<AgentComment["severity"], string> = {
    CRITICAL: "⛔",
    HIGH:     "🔴",
    MEDIUM:   "⚠️",
    LOW:      "🔵",
    INFO:     "ℹ️",
};

const SECTION_META: Record<AgentComment["category"], { emoji: string; label: string }> = {
    BUG:           { emoji: "🔍", label: "Potential Issues"   },
    SECURITY:      { emoji: "🔒", label: "Security Issues"    },
    PERFORMANCE:   { emoji: "⚡", label: "Performance"        },
    REFACTOR:      { emoji: "💡", label: "Code Suggestions"   },
    STYLE:         { emoji: "💡", label: "Code Suggestions"   },
    DOCUMENTATION: { emoji: "📝", label: "Documentation"      },
    TEST:          { emoji: "🧪", label: "Test Coverage"      },
    OTHER:         { emoji: "💡", label: "Other"              },
};

const prTitleTag = (title: string | null): string => {
    if (!title) return "";
    const words = title.trim().split(/\s+/).slice(0, 5).join(" ");
    return ` — ${words}`;
};

const buildSummaryBlock = (state: PRReviewStateType, comments: AgentComment[]): string => {
    const f = state.changedFiles.length;
    const n = comments.length;
    const blockingCount = comments.filter((c) => c.blocking).length;

    if (n === 0) {
        return `Reviewed **${f} file${f !== 1 ? "s" : ""}**. No issues found — this PR looks good to merge.`;
    }

    const sorted = [...comments].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

    const byCategory = new Map<string, number>();
    for (const c of comments) {
        const label = SECTION_META[c.category]?.label ?? c.category;
        byCategory.set(label, (byCategory.get(label) ?? 0) + 1);
    }
    const categoryBreakdown = [...byCategory.entries()]
        .map(([label, count]) => `${count} ${label.toLowerCase()}`)
        .join(", ");

    const topFindings = sorted.slice(0, 3).map((c) => {
        const file = c.filePath.split("/").pop() ?? c.filePath;
        const sentence = c.body.split(/\.\s/)[0]?.trim() ?? c.body;
        const clipped = sentence.length > 100 ? sentence.slice(0, 97) + "…" : sentence;
        return `- \`${file}:${c.line}\` — ${clipped}.`;
    });

    const parts = [
        `Reviewed **${f} file${f !== 1 ? "s" : ""}** and found **${n} issue${n !== 1 ? "s" : ""}** (${categoryBreakdown})${blockingCount > 0 ? `, **${blockingCount} blocking**` : ""}.`,
        "",
        "**Key findings:**",
        ...topFindings,
    ];

    if (blockingCount > 0) {
        parts.push("", `All ${blockingCount} blocking issue${blockingCount !== 1 ? "s" : ""} must be resolved before this PR can merge.`);
    }

    return parts.join("\n");
};

const renderItem = (c: AgentComment): string[] => {
    const file = c.filePath.split("/").pop() ?? c.filePath;
    const blockingBadge = c.blocking ? " · **blocking**" : "";
    const lines: string[] = [];

    lines.push(`**\`${file}:${c.line}\`**${blockingBadge} — ${c.body}`);

    if (c.currentCode) {
        lines.push(`> **Current code:** \`${c.currentCode.trim()}\``);
    }
    if (c.suggestion) {
        lines.push(`> **Fix:** \`${c.suggestion.trim().replace(/\n/g, " ").slice(0, 200)}\``);
    }

    return lines;
};

const renderSeverityGrouped = (items: AgentComment[]): string[] => {
    const grouped = new Map<AgentComment["severity"], AgentComment[]>();
    for (const c of items) {
        const arr = grouped.get(c.severity) ?? [];
        arr.push(c);
        grouped.set(c.severity, arr);
    }

    const severityOrder: AgentComment["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
    const lines: string[] = [];

    for (const sev of severityOrder) {
        const group = grouped.get(sev);
        if (!group || group.length === 0) continue;

        const blockingInGroup = group.filter((c) => c.blocking).length;
        const blockingTag = blockingInGroup > 0 ? ` · ${blockingInGroup} blocking` : "";
        lines.push(`**${SEVERITY_EMOJI[sev]} ${sev} (${group.length} issue${group.length !== 1 ? "s" : ""}${blockingTag})**`);
        lines.push("");

        for (const c of group) {
            lines.push(...renderItem(c));
            lines.push("");
        }
    }

    return lines;
};

const buildComment = (state: PRReviewStateType, comments: AgentComment[], durationMs: number): string => {
    const blockingCount = comments.filter((c) => c.blocking).length;
    const hasCriticalOrHigh = comments.some((c) => c.severity === "CRITICAL" || c.severity === "HIGH");
    const durationSec = (durationMs / 1000).toFixed(1);

    const verdict = hasCriticalOrHigh
        ? "⛔ **Changes requested** — blocking issues must be resolved before merging."
        : comments.length > 0
            ? "⚠️ **Review complete** — non-blocking issues noted."
            : "✅ **Looks good!** — No issues found.";

    const lines: string[] = [
        `## Code Review${prTitleTag(state.prTitle)}`,
        "",
        buildSummaryBlock(state, comments),
        "",
        verdict,
        "",
    ];

    if (blockingCount > 0) {
        lines.push(`> [!CAUTION]`);
        lines.push(`> **${blockingCount} blocking issue${blockingCount !== 1 ? "s" : ""}** must be fixed before this PR can merge.`);
        lines.push("");
    }

    // Collect items per section label (REFACTOR+STYLE merge into "Code Suggestions")
    type SectionData = { emoji: string; label: string; items: AgentComment[] };
    const sections = new Map<string, SectionData>();

    for (const cat of SECTION_ORDER) {
        const catItems = comments.filter((c) => c.category === cat);
        if (catItems.length === 0) continue;
        const { emoji, label } = SECTION_META[cat];
        if (!sections.has(label)) sections.set(label, { emoji, label, items: [] });
        sections.get(label)!.items.push(...catItems);
    }

    for (const [, { emoji, label, items }] of sections) {
        const blockingInSection = items.filter((c) => c.blocking).length;
        const blockingTag = blockingInSection > 0 ? ` · ${blockingInSection} blocking` : "";
        const summaryLine = `${emoji} ${label} &nbsp;·&nbsp; ${items.length} issue${items.length !== 1 ? "s" : ""}${blockingTag}`;

        lines.push(`<details>`);
        lines.push(`<summary>${summaryLine}</summary>`);
        lines.push("");

        // Security and Performance: group by severity with headers + code snippets
        // Bug/Refactor/Style/Other: flat readable list
        const useGrouped = label === "Security Issues" || label === "Performance";
        if (useGrouped) {
            lines.push(...renderSeverityGrouped(items));
        } else {
            lines.push("**Issues:**");
            lines.push("");
            for (const c of items) {
                lines.push(...renderItem(c));
                lines.push("");
            }
        }

        lines.push(`</details>`);
        lines.push("");
    }

    lines.push("---");
    lines.push(`*Reviewed ${state.changedFiles.length} file${state.changedFiles.length !== 1 ? "s" : ""} in ${durationSec}s · Generated by [PullRabbit](https://github.com/apps/pull-rabbit)*`);

    return lines.join("\n");
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
                        body: "**PullRabbit** encountered an error during review. Please try again.",
                    });
                } catch { /* best-effort */ }
            }
            return {};
        }

        const comments = state.allComments;
        const body = buildComment(state, comments, totalDurationMs);

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
        } catch { /* best-effort */ }

        if (comments.length > 0) {
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
        }

        await db.reviewSession.update({
            where: { id: state.reviewSessionId },
            data: {
                status: "COMPLETED",
                filesReviewed: state.changedFiles.length,
                totalComments: comments.length,
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
