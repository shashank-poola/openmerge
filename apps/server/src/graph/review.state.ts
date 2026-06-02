import { Annotation } from "@langchain/langgraph";
import type {
    AgentComment,
    LinterIssue,
    PRHistoryEntry,
    ImportSource,
    ASTSummary,
    CodeGraphNode,
} from "../types/review-context.type";

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
    allComments: Annotation<AgentComment[]>({
        value: (_prev, next) => next,
        default: () => [],
    }),

    error: Annotation<string | null>({
        value: (_prev, next) => next,
        default: () => null,
    }),
});

export type PRReviewStateType = typeof PRReviewState.State;
