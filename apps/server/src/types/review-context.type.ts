export type AgentComment = {
    filePath: string;
    line: number;
    startLine?: number;
    body: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    category: "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "REFACTOR" | "DOCUMENTATION" | "TEST" | "OTHER";
    suggestion?: string;
    blocking?: boolean;
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
