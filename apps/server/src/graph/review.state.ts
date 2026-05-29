import { Annotation } from "@langchain/langgraph";

export type AgentComment = {
    filePath: string;
    line: number;
    startLine?: number;
    body: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    category: "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "REFACTOR" | "DOCUMENTATION" | "TEST" | "OTHER";
    suggestion?: string;
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
