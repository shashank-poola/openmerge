import type { AgentComment, PRReviewStateType } from "../review.state";
import type { ReviewSummary } from "../../agent/review-summary";

const SECTION_ORDER: AgentComment["category"][] = [
  "BUG",
  "SECURITY",
  "PERFORMANCE",
  "REFACTOR",
  "STYLE",
  "DOCUMENTATION",
  "TEST",
  "OTHER",
];

const SEVERITY_EMOJI: Record<AgentComment["severity"], string> = {
  CRITICAL: "⛔",
  HIGH: "🔴",
  MEDIUM: "⚠️",
  LOW: "🔵",
  INFO: "ℹ️",
};

const SECTION_META: Record<AgentComment["category"], { emoji: string; label: string; singular: string }> = {
  BUG: { emoji: "🔍", label: "Potential Issues", singular: "potential issue" },
  SECURITY: { emoji: "🔒", label: "Security Issues", singular: "security issue" },
  PERFORMANCE: { emoji: "⚡", label: "Performance", singular: "performance issue" },
  REFACTOR: { emoji: "💡", label: "Code Suggestions", singular: "code suggestion" },
  STYLE: { emoji: "💡", label: "Code Suggestions", singular: "code suggestion" },
  DOCUMENTATION: { emoji: "📝", label: "Documentation", singular: "documentation item" },
  TEST: { emoji: "🧪", label: "Test Coverage", singular: "test coverage item" },
  OTHER: { emoji: "💡", label: "Other", singular: "other item" },
};

const SEVERITY_GROUPED_LABELS = new Set(["Security Issues", "Performance"]);
const SEVERITY_ORDER: AgentComment["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

type SectionData = { emoji: string; label: string; singular: string; items: AgentComment[] };

const plural = (n: number, word: string) => `${n} ${word}${n !== 1 ? "s" : ""}`;
const isBlocking = (comment: AgentComment) => comment.severity === "CRITICAL" || comment.severity === "HIGH";
const countBlocking = (items: AgentComment[]) => items.filter(isBlocking).length;
const clip = (text: string, max: number) => text.length > max ? `${text.slice(0, max - 3)}…` : text;
const firstSentence = (text: string) => text.split(/\.\s+/)[0]?.trim() ?? text;
const endWithPeriod = (text: string) => {
  const trimmed = text.trim().replace(/[—–]/g, "-");
  if (!trimmed) return trimmed;
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};
const sanitizeMarkdownText = (text: string, max: number) => {
  const normalized = text.trim().replace(/\s+/g, " ").replace(/[—–]/g, "-");
  const escaped = normalized.replace(/[\\`*_{}\[\]()<>#|]/g, "\\$&");
  return clip(escaped.replace(/https?:\/\//gi, (scheme) => scheme.replace(":", "\\:")), max);
};
const sanitizeInlineCode = (text: string, max: number) =>
  clip(text.trim().replace(/\s+/g, " ").replace(/`/g, "'").replace(/[—–]/g, "-"), max);
const prTitleTag = (title: string | null): string => {
  if (!title?.trim()) return "";
  return ` - ${sanitizeMarkdownText(title, 140)}`;
};

const buildSummaryLine = (fileCount: number, comments: AgentComment[]): string => {
  const files = plural(fileCount, "file");
  if (comments.length === 0) return `Reviewed **${files}** - no verified actionable findings.`;
  const blocking = countBlocking(comments);
  const blockingPart = blocking > 0 ? ` · **${blocking} blocking**` : "";
  return `Reviewed **${files}** · **${plural(comments.length, "issue")}**${blockingPart}`;
};

const buildSectionIntro = (singular: string, items: AgentComment[]): string => {
  const blocking = countBlocking(items);
  const blockingNote = blocking > 0 ? `, **${blocking} blocking**` : "";
  const preview = endWithPeriod(sanitizeMarkdownText(firstSentence(items[0]?.body ?? ""), 90));
  return `Found **${plural(items.length, singular)}**${blockingNote}. ${preview}`;
};

const renderItem = (comment: AgentComment): string[] => {
  const blockingBadge = isBlocking(comment) ? " · **blocking**" : "";
  const body = endWithPeriod(sanitizeMarkdownText(firstSentence(comment.body), 100));
  const lines = [`- \`${sanitizeInlineCode(comment.filePath, 220)}:${comment.line}\`${blockingBadge} - ${body}`];

  if (comment.currentCode) {
    lines.push(`  - **Current code:** \`${sanitizeInlineCode(comment.currentCode, 200)}\``);
  }
  if (comment.suggestion) {
    lines.push(`  - **Fix:** \`${sanitizeInlineCode(comment.suggestion, 200)}\``);
  }

  return lines;
};

const renderSeverityGrouped = (items: AgentComment[]): string[] => {
  const grouped = new Map<AgentComment["severity"], AgentComment[]>();
  for (const comment of items) {
    const group = grouped.get(comment.severity) ?? [];
    group.push(comment);
    grouped.set(comment.severity, group);
  }

  const lines: string[] = [];
  for (const severity of SEVERITY_ORDER) {
    const group = grouped.get(severity);
    if (!group?.length) continue;

    const blockingTag = countBlocking(group) > 0 ? ` · ${countBlocking(group)} blocking` : "";
    lines.push(`**${SEVERITY_EMOJI[severity]} ${severity}${blockingTag}**`, "");
    for (const comment of group) lines.push(...renderItem(comment));
    lines.push("");
  }

  return lines;
};

const buildSections = (comments: AgentComment[]): Map<string, SectionData> => {
  const sections = new Map<string, SectionData>();
  for (const category of SECTION_ORDER) {
    const items = comments.filter((comment) => comment.category === category);
    if (!items.length) continue;

    const { emoji, label, singular } = SECTION_META[category];
    if (!sections.has(label)) sections.set(label, { emoji, label, singular, items: [] });
    sections.get(label)?.items.push(...items);
  }
  return sections;
};

export const buildReviewComment = (
  state: PRReviewStateType,
  comments: AgentComment[],
  durationMs: number,
  reviewSummary: ReviewSummary | null = null,
): string => {
  const blockingCount = countBlocking(comments);
  const durationSec = (durationMs / 1000).toFixed(1);
  const verdict = blockingCount > 0
    ? "⛔ **Changes requested**. Blocking issues must be resolved before merging."
    : state.reviewCoverage === "limited"
      ? "⚠️ **Review incomplete**. OpenMerge did not publish unverified findings."
      : comments.length > 0
        ? "⚠️ **Review complete**. Non-blocking suggestions noted."
        : "✅ **Review complete**. No verified actionable findings were found.";
  const filesNeedingAttention = [...new Set(comments.map((comment) => comment.filePath))].slice(0, 5);
  const fallbackSummary: ReviewSummary = {
    overview: comments.length === 0
      ? `This PR updates ${state.prTitle?.trim() || "the repository"}.`
      : blockingCount > 0
        ? "This PR introduces changes that require review before merging."
        : "This PR includes review suggestions that do not block merging.",
    bullets: comments.length === 0
      ? [`Updates ${plural(state.changedFiles.length, "changed file")}.`]
      : [`Introduces ${plural(comments.length, "review finding")}.`],
    mergeAssessment: comments.length === 0
      ? state.reviewCoverage === "limited"
        ? "The available evidence did not support a complete automated review."
        : "No verified actionable findings were detected."
      : blockingCount > 0
        ? "The PR is not yet safe to merge."
        : "No blocking issues were detected.",
    mergeReason: comments.length === 0
      ? state.reviewCoverage === "limited"
        ? "Some candidates or review coverage could not be verified."
        : "No verified blocking issues were found in the reviewed changes."
      : blockingCount > 0
        ? "Blocking findings require attention before merging."
        : "The remaining findings are non-blocking suggestions.",
  };
  const summary = reviewSummary ?? fallbackSummary;
  const overview = state.reviewCoverage === "limited"
    ? `${fallbackSummary.overview} Automated review coverage was incomplete.`
    : summary.overview;
  const lines: string[] = [
    `## OpenMerge Summary${prTitleTag(state.prTitle)}`,
    "",
    endWithPeriod(sanitizeMarkdownText(overview, 240)),
    "",
    ...summary.bullets.slice(0, 4).map((bullet) => `- ${endWithPeriod(sanitizeMarkdownText(bullet, 180))}`),
    "",
  ];

  if (comments.length === 0) {
    lines.push(
      verdict,
      "",
      state.reviewCoverage === "limited"
        ? "Some review coverage was unavailable. Unverified findings were suppressed."
        : "No verified actionable findings found in " + plural(state.changedFiles.length, "changed file") + ".",
      "This automated review is not proof that the change is safe to merge.",
      "",
    );
  } else {
    const mergeAssessment = blockingCount > 0
      ? `The PR is not yet safe to merge because ${plural(blockingCount, "blocking issue")} ${blockingCount === 1 ? "requires" : "require"} attention.`
      : state.reviewCoverage === "limited"
        ? "The automated review is incomplete. Published findings are non-blocking, but omitted coverage can contain blocking defects."
      : "The PR has no blocking issues; the remaining suggestions are non-blocking.";
    const mergeReason = blockingCount > 0
      ? endWithPeriod(sanitizeMarkdownText(summary.mergeReason, 240))
      : state.reviewCoverage === "limited"
        ? "Unverified findings were suppressed and must not be treated as a clean result."
      : "The remaining findings are non-blocking suggestions.";
    lines.push(
      mergeAssessment,
      mergeReason,
      "",
      ...(filesNeedingAttention.length > 0
        ? [`**Files Needing Attention:** ${filesNeedingAttention.map((file) => `\`${sanitizeInlineCode(file, 220)}\``).join(", ")}`, ""]
        : []),
      buildSummaryLine(state.changedFiles.length, comments),
      "",
      verdict,
      "",
      ...(state.reviewCoverage === "limited"
        ? ["**Coverage note:** Some changed code or candidate findings could not be verified.", ""]
        : []),
    );
  }

  for (const [, { emoji, label, singular, items }] of buildSections(comments)) {
    const blocking = countBlocking(items);
    const blockingTag = blocking > 0 ? ` · ${blocking} blocking` : "";
    const summary = `${emoji} ${label} &nbsp;·&nbsp; ${plural(items.length, "issue")}${blockingTag}`;

    lines.push(
      "<details>",
      `<summary>${summary}</summary>`,
      "",
      buildSectionIntro(singular, items),
      "",
    );

    if (SEVERITY_GROUPED_LABELS.has(label)) {
      lines.push(...renderSeverityGrouped(items));
    } else {
      for (const comment of items) lines.push(...renderItem(comment));
      lines.push("");
    }

    lines.push("</details>", "");
  }

  lines.push("---");
  lines.push(`*Reviewed ${plural(state.changedFiles.length, "file")} in ${durationSec}s*`);

  return lines.join("\n");
};
