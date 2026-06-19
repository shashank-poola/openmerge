import { exec } from "child_process";
import { promisify } from "util";
import { join, extname, relative } from "path";
import type { LinterIssue } from "../../types/review-context.type";

const execAsync = promisify(exec);

const TS_JS_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);
const PYTHON_EXTS = new Set([".py"]);

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

type RuffMessage = {
    code: string;
    message: string;
    filename: string;
    location: { row: number; column: number };
    end_location: { row: number; column: number };
};

// ── ESLint ────────────────────────────────────────────────────────────────────

const runESLint = async (
    files: string[],
    repoLocalPath: string
): Promise<LinterIssue[]> => {
    const issues: LinterIssue[] = [];
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

// ── Ruff (Python) ─────────────────────────────────────────────────────────────

const runRuff = async (
    files: string[],
    repoLocalPath: string
): Promise<LinterIssue[]> => {
    const issues: LinterIssue[] = [];
    const fileArgs = files.map((f) => `"${f}"`).join(" ");

    const { stdout } = await execAsync(
        `ruff check --output-format json ${fileArgs}`,
        { cwd: repoLocalPath, timeout: 30_000 }
    );

    const results: RuffMessage[] = JSON.parse(stdout);
    for (const result of results) {
        const relPath = relative(repoLocalPath, result.filename);
        issues.push({
            filePath: relPath,
            line: result.location.row,
            endLine: result.end_location.row,
            column: result.location.column,
            rule: result.code,
            message: result.message,
            severity: "warning",
        });
    }

    return issues;
};

// ── Entry point ───────────────────────────────────────────────────────────────

export const runLinters = async (params: {
    changedFiles: string[];
    repoLocalPath: string;
}): Promise<LinterIssue[]> => {
    const tsJsFiles = params.changedFiles
        .filter((f) => TS_JS_EXTS.has(extname(f)))
        .map((f) => join(params.repoLocalPath, f));

    const pythonFiles = params.changedFiles
        .filter((f) => PYTHON_EXTS.has(extname(f)))
        .map((f) => join(params.repoLocalPath, f));

    const issues: LinterIssue[] = [];

    // ESLint for TS/JS
    if (tsJsFiles.length > 0) {
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
        }
    }

    // Ruff for Python (exit code 1 = issues found, stdout still has JSON)
    if (pythonFiles.length > 0) {
        try {
            const ruffIssues = await runRuff(pythonFiles, params.repoLocalPath);
            issues.push(...ruffIssues);
        } catch (err) {
            const error = err as { stdout?: string; code?: number };
            if (error.stdout && error.code === 1) {
                try {
                    const results: RuffMessage[] = JSON.parse(error.stdout);
                    for (const result of results) {
                        const relPath = relative(params.repoLocalPath, result.filename);
                        issues.push({
                            filePath: relPath,
                            line: result.location.row,
                            endLine: result.end_location.row,
                            column: result.location.column,
                            rule: result.code,
                            message: result.message,
                            severity: "warning",
                        });
                    }
                } catch { /* malformed JSON from ruff — skip */ }
            }
            // ruff not installed or config error — skip silently
        }
    }

    return issues;
};
