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

const SEVERITY_EMOJI: Record<AgentComment["severity"], string> = {
    CRITICAL: "⛔",
    HIGH:     "🔴",
    MEDIUM:   "⚠️",
    LOW:      "🔵",
    INFO:     "ℹ️",
};

const SECTION_META: Record<AgentComment["category"], { emoji: string; label: string }> = {
    BUG:           { emoji: "🔍", label: "Potential Issues" },
    SECURITY:      { emoji: "🔒", label: "Security Issues"  },
    PERFORMANCE:   { emoji: "⚡", label: "Performance"      },
    REFACTOR:      { emoji: "💡", label: "Code Suggestions" },
    STYLE:         { emoji: "💡", label: "Code Suggestions" },
    DOCUMENTATION: { emoji: "📝", label: "Documentation"    },
    TEST:          { emoji: "🧪", label: "Test Coverage"    },
    OTHER:         { emoji: "💡", label: "Other"            },
};

const SEVERITY_GROUPED_LABELS = new Set(["Security Issues", "Performance"]);

const plural = (n: number, word: string) => `${n} ${word}${n !== 1 ? "s" : ""}`;

const countBlocking = (items: AgentComment[]) => items.filter((c) => c.blocking).length;

const clip = (text: string, max: number) =>
    text.length > max ? text.slice(0, max - 3) + "…" : text;

const firstSentence = (text: string) => text.split(/\.\s+/)[0]?.trim() ?? text;

const prTitleTag = (title: string | null): string => {
    if (!title) return "";
    return ` — ${title.trim().split(/\s+/).slice(0, 5).join(" ")}`;
};

type SectionData = { emoji: string; label: string; items: AgentComment[] };

const buildSummaryLine = (fileCount: number, comments: AgentComment[]): string => {
    const files = plural(fileCount, "file");
    if (comments.length === 0) return `Reviewed **${files}** — no issues found.`;
    const blocking = countBlocking(comments);
    const blockingPart = blocking > 0 ? ` · **${plural(blocking, "blocking")}**` : "";
    return `Reviewed **${files}** · **${plural(comments.length, "issue")}**${blockingPart}`;
};

const buildSectionIntro = (label: string, items: AgentComment[]): string => {
    const blocking = countBlocking(items);
    const blockingNote = blocking > 0 ? `, **${plural(blocking, "blocking")}**` : "";
    const preview = clip(firstSentence(items[0]?.body ?? ""), 90);
    return `Found **${plural(items.length, label.toLowerCase())}**${blockingNote}. ${preview}.`;
};

const renderItem = (c: AgentComment): string[] => {
    const file = c.filePath.split("/").pop() ?? c.filePath;
    const blockingBadge = c.blocking ? " · **blocking**" : "";
    const body = clip(firstSentence(c.body), 100);

    const lines = [`- **\`${file}:${c.line}\`**${blockingBadge} — ${body}.`];
    if (c.currentCode) lines.push(`  - **Current code:** \`${c.currentCode.trim()}\``);
    if (c.suggestion)  lines.push(`  - **Fix:** \`${c.suggestion.trim().replace(/\n/g, " ").slice(0, 200)}\``);
    return lines;
};

const renderSeverityGrouped = (items: AgentComment[]): string[] => {
    const severityOrder: AgentComment["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

    const grouped = new Map<AgentComment["severity"], AgentComment[]>();
    for (const c of items) {
        const bucket = grouped.get(c.severity) ?? [];
        bucket.push(c);
        grouped.set(c.severity, bucket);
    }

    const lines: string[] = [];
    for (const sev of severityOrder) {
        const group = grouped.get(sev);
        if (!group?.length) continue;

        const blockingTag = countBlocking(group) > 0 ? ` · ${countBlocking(group)} blocking` : "";
        lines.push(`**${SEVERITY_EMOJI[sev]} ${sev}${blockingTag}**`, "");
        for (const c of group) lines.push(...renderItem(c));
        lines.push("");
    }
    return lines;
};

const buildSections = (comments: AgentComment[]): Map<string, SectionData> => {
    const sections = new Map<string, SectionData>();
    for (const cat of SECTION_ORDER) {
        const items = comments.filter((c) => c.category === cat);
        if (!items.length) continue;
        const { emoji, label } = SECTION_META[cat];
        if (!sections.has(label)) sections.set(label, { emoji, label, items: [] });
        sections.get(label)!.items.push(...items);
    }
    return sections;
};

const buildComment = (state: PRReviewStateType, comments: AgentComment[], durationMs: number): string => {
    const hasCriticalOrHigh = comments.some((c) => c.severity === "CRITICAL" || c.severity === "HIGH");
    const durationSec = (durationMs / 1000).toFixed(1);

    const verdict = hasCriticalOrHigh
        ? "⛔ **Changes requested** — blocking issues must be resolved before merging."
        : comments.length > 0
            ? "⚠️ **Review complete** — non-blocking suggestions noted."
            : "✅ **Looks good to merge!**";

    const lines: string[] = [
        `## Code Review${prTitleTag(state.prTitle)}`,
        "",
        buildSummaryLine(state.changedFiles.length, comments),
        "",
        verdict,
        "",
    ];

    for (const [, { emoji, label, items }] of buildSections(comments)) {
        const blocking = countBlocking(items);
        const blockingTag = blocking > 0 ? ` · ${blocking} blocking` : "";
        const summary = `${emoji} ${label} &nbsp;·&nbsp; ${plural(items.length, "issue")}${blockingTag}`;

        lines.push(
            `<details>`,
            `<summary>${summary}</summary>`,
            "",
            buildSectionIntro(label, items),
            "",
        );

        if (SEVERITY_GROUPED_LABELS.has(label)) {
            lines.push(...renderSeverityGrouped(items));
        } else {
            for (const c of items) lines.push(...renderItem(c));
            lines.push("");
        }

        lines.push(`</details>`, "");
    }

    lines.push("---");
    lines.push(`*Reviewed ${plural(state.changedFiles.length, "file")} in ${durationSec}s · Generated by [PullRabbit](https://github.com/apps/pull-rabbit)*`);

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
                } catch { /* */ }
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
        } catch { /* */ }

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
