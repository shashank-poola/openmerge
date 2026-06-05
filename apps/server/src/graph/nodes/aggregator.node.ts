import type { PRReviewStateType, AgentComment } from "../review.state";

const SEVERITY_RANK: Record<AgentComment["severity"], number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
};

const MAX_COMMENTS = 12;

export const aggregateComments = (state: PRReviewStateType): Partial<PRReviewStateType> => {
    const all = [
        ...state.codeComments,
        ...state.securityComments,
        ...state.performanceComments,
    ];

    const seen = new Set<string>();
    const deduped = all.filter((c) => {
        const key = `${c.filePath}:${c.line}:${c.body.slice(0, 60)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const sorted = deduped.sort(
        (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
    );

    // Prioritize blocking comments, then cap total
    const blocking = sorted.filter((c) => c.blocking !== false && SEVERITY_RANK[c.severity] >= 4);
    const rest = sorted.filter((c) => !blocking.includes(c));
    const capped = [...blocking, ...rest].slice(0, MAX_COMMENTS);

    return { allComments: capped };
};
