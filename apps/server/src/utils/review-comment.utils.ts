import type { AgentComment } from "../types/review-context.type";

export function buildReviewCommentKey(reviewSessionId: string, comment: AgentComment): string {
  return [
    reviewSessionId,
    comment.filePath,
    comment.line,
    comment.startLine ?? "",
    comment.severity,
    comment.category,
    comment.body,
  ].join("\u001f");
}
