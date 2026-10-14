import type { AgentComment } from "../types/review-context.type";

export const SPECIALIST_REVIEW_POLICY = `
## Evidence and severity policy
A finding is eligible only when the changed code demonstrates all four of: changed behavior, a supported trigger, a concrete consequence, and an actionable correction. Suppress unsupported hypotheses, questions, style-only advice, optional cleanup, and INFO-only observations.

- CRITICAL requires demonstrated catastrophic impact, such as broad compromise, irreversible data loss, or widespread outage.
- HIGH requires demonstrated significant impact on a common supported path or a serious exploitable boundary.
- MEDIUM is a confirmed, bounded defect under specific supported conditions.
- LOW is a confirmed minor defect. LOW never means low confidence.

The host derives blocking status centrally. The required \`blocking\` field must be a boolean, but never use it to make a finding blocking: only accepted HIGH and CRITICAL findings block.`;

export const isBlockingSeverity = (severity: AgentComment["severity"]): boolean =>
    severity === "CRITICAL" || severity === "HIGH";
