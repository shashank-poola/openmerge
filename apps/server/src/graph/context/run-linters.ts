import { exec } from "child_process";
import { promisify } from "util";
import { join, extname, relative } from "path";
import type { LinterIssue } from "../review.state";

const execAsync = promisify(exec);

const TS_JS_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);

type ESLintMessage = {
    ruleId: string | null;
    severity: number; // 1 = warn, 2 = error
    message: string;
    line: number;
    endLine?: number;
    column: number;
};

type ESLintResult = {
    filePath: string;
    messages: ESLintMessage[];
};

const runESLint = async (
    files: string[],
    repoLocalPath: string
): Promise<LinterIssue[]> => {
    const issues: LinterIssue[] = [];

    // Quote each file path to handle spaces
    const fileArgs = files.map((f) => `"${f}"`).join(" ");

    const { stdout } = await execAsync(
        `npx --no-install eslint --format json ${fileArgs}`,
        { cwd: repoLocalPath, timeout: 60_000 }
    );

    const results: ESLintResult[] = JSON.parse(stdout);
    for (const result of results) {
        const relPath = relative(repoLocalPath, result.filePath);
        for (const msg of result.messages) {
            if (!msg.message) continue;
            issues.push({
                filePath: relPath,
                line: msg.line,
                endLine: msg.endLine,
                column: msg.column,
                rule: msg.ruleId ?? "eslint/parse-error",
                message: msg.message,
                severity: msg.severity === 2 ? "error" : "warning",
            });
        }
    }

    return issues;
};

export const runLinters = async (params: {
    changedFiles: string[];
    repoLocalPath: string;
}): Promise<LinterIssue[]> => {
    const tsJsFiles = params.changedFiles
        .filter((f) => TS_JS_EXTS.has(extname(f)))
        .map((f) => join(params.repoLocalPath, f));

    if (tsJsFiles.length === 0) return [];

    const issues: LinterIssue[] = [];

    // ESLint
    try {
        const eslintIssues = await runESLint(tsJsFiles, params.repoLocalPath);
        issues.push(...eslintIssues);
    } catch (err) {
        // ESLint exit code 1 = lint errors found (stdout still has JSON)
        // ESLint exit code 2 = config error or no files — skip silently
        const error = err as { stdout?: string; code?: number };
        if (error.stdout && error.code === 1) {
            try {
                const results: ESLintResult[] = JSON.parse(error.stdout);
                for (const result of results) {
                    const relPath = relative(params.repoLocalPath, result.filePath);
                    for (const msg of result.messages) {
                        if (!msg.message) continue;
                        issues.push({
                            filePath: relPath,
                            line: msg.line,
                            endLine: msg.endLine,
                            column: msg.column,
                            rule: msg.ruleId ?? "eslint/parse-error",
                            message: msg.message,
                            severity: msg.severity === 2 ? "error" : "warning",
                        });
                    }
                }
            } catch { /* malformed JSON from eslint — skip */ }
        }
        // code 2 or no eslint → skip silently
    }

    return issues;
};
