import type { AgentComment } from "../types/review-context.type";
import type { FindingCandidate, FindingVerdict, VerificationStats } from "./finding-verifier.types";

const SEVERITY_RANK: Record<AgentComment["severity"], number> = {
  INFO: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const lowerSeverity = (
  original: AgentComment["severity"],
  verified: AgentComment["severity"],
): AgentComment["severity"] => SEVERITY_RANK[verified] <= SEVERITY_RANK[original] ? verified : original;

export const applyVerifierVerdicts = (
  candidates: FindingCandidate[],
  verdicts: FindingVerdict[],
): { comments: AgentComment[]; stats: VerificationStats } => {
  const candidatesById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const comments: AgentComment[] = [];
  const stats: VerificationStats = {
    candidates: candidates.length,
    kept: 0,
    suppressed: 0,
    uncertain: 0,
    demoted: 0,
  };

  for (const verdict of verdicts) {
    if (verdict.verdict !== "keep") {
      if (verdict.verdict === "suppress") stats.suppressed += 1;
      else stats.uncertain += 1;
      continue;
    }

    const candidate = candidatesById.get(verdict.candidateId);
    if (!candidate) continue;
    const severity = lowerSeverity(candidate.comment.severity, verdict.severity);
    if (severity !== candidate.comment.severity) stats.demoted += 1;
    stats.kept += 1;
    comments.push({
      ...candidate.comment,
      body: verdict.body,
      severity,
      blocking: severity === "HIGH" || severity === "CRITICAL",
      suggestion: verdict.preserveSuggestion ? candidate.comment.suggestion : undefined,
    });
  }

  return { comments, stats };
};
