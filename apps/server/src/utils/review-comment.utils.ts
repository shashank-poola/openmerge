import { createHash } from "node:crypto";
import type { AgentComment } from "../types/review-context.type";

export function buildReviewCommentKey(reviewSessionId: string, comment: AgentComment): string {
  const payload = [
    reviewSessionId,
    comment.filePath,
    comment.line,
    comment.startLine ?? "",
    comment.severity,
    comment.category,
    comment.body,
  ].join("\u001f");

  return createHash("sha256").update(payload).digest("hex");
}
