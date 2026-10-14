import { Annotation } from "@langchain/langgraph";
import type {
    AgentComment,
    LinterIssue,
    PRHistoryEntry,
    ImportSource,
    ASTSummary,
    CodeGraphNode,
} from "../types/review-context.type";
import type { FindingCandidate, VerificationStats } from "../agent/finding-verifier.types";

export type {
    AgentComment,
    LinterIssue,
    PRHistoryEntry,
    ImportSource,
    ASTSummary,
    CodeGraphNode,
};

export const PRReviewState = Annotation.Root({
    reviewSessionId: Annotation<string>,
    repositoryId: Annotation<string>,
    jobId: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),
    leaseId: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),
    workerId: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),
    githubInstallationId: Annotation<string>,
    prNumber: Annotation<number>,
    headSha: Annotation<string>,
    baseBranch: Annotation<string>,
    owner: Annotation<string>,
    repoName: Annotation<string>,

    diff: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),
    changedFiles: Annotation<string[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    prTitle: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),

    repoLocalPath: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),
    astSummaries: Annotation<ASTSummary[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    codeGraph: Annotation<CodeGraphNode[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    linterResults: Annotation<LinterIssue[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    prHistory: Annotation<PRHistoryEntry[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    importSources: Annotation<ImportSource[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),

    codeComments: Annotation<AgentComment[]>({
        value: (prev, next) => [...prev, ...next],
        default: () => [],
    }),
    securityComments: Annotation<AgentComment[]>({
        value: (prev, next) => [...prev, ...next],
        default: () => [],
    }),
    performanceComments: Annotation<AgentComment[]>({
        value: (prev, next) => [...prev, ...next],
        default: () => [],
    }),
    agentFailures: Annotation<string[]>({
        value: (prev, next) => [...prev, ...next],
        default: () => [],
    }),
    candidateFindings: Annotation<FindingCandidate[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    verifiedComments: Annotation<AgentComment[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),
    verificationStats: Annotation<VerificationStats>({
        value: (_prev, next) => next,
        default: () => ({ candidates: 0, kept: 0, suppressed: 0, uncertain: 0, demoted: 0 }),
    }),
    reviewCoverage: Annotation<"complete" | "limited">({
        value: (prev, next) => prev === "limited" || next === "limited" ? "limited" : "complete",
        default: () => "complete",
    }),
    allComments: Annotation<AgentComment[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),

    error: Annotation<string | null>({
        value: (prev, next) => next === "REVIEW_OWNERSHIP_LOST" ? next : prev ?? next,
        default: () => null,
    }),
});

export type PRReviewStateType = typeof PRReviewState.State;
