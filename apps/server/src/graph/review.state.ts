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

export type LinterIssue = {
    filePath: string;
    line: number;
    endLine?: number;
    column: number;
    rule: string;
    message: string;
    severity: "error" | "warning";
};

export type PRHistoryEntry = {
    prNumber: number;
    prTitle: string;
    filePath: string;
    line: number | null;
    body: string;
    author: string;
    createdAt: string;
};

export type ImportSource = {
    importPath: string;
    resolvedPath: string;
    sourceCode: string;
    usedInFile: string;
};

export type ASTSummary = {
    filePath: string;
    language: string;
    functions: Array<{
        name: string;
        startLine: number;
        isExported: boolean;
        isAsync: boolean;
    }>;
    classes: Array<{
        name: string;
        startLine: number;
        isExported: boolean;
        methods: string[];
    }>;
    imports: Array<{
        source: string;
        specifiers: string[];
        isLocal: boolean;
    }>;
};

export type CodeGraphNode = {
    filePath: string;
    functionName: string;
    calls: Array<{ name: string; resolvedFile?: string }>;
    calledBy: Array<{ functionName: string; filePath: string; line: number }>;
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

    // base PR data
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

    // context enrichment
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

    // agent outputs
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
