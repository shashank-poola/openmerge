import type { PRReviewStateType, AgentComment } from "../review.state";

const SEVERITY_RANK: Record<AgentComment["severity"], number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
};

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

    return { allComments: sorted };
};
