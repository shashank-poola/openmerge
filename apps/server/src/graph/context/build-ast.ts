import { readFile, access } from "fs/promises";
import { join, extname } from "path";
import type { ASTSummary } from "../../types/review-context.type";

const SUPPORTED_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);

const extractFunctions = (lines: string[]): ASTSummary["functions"] => {
    const functions: ASTSummary["functions"] = [];

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//") || t.startsWith("*")) return;

        // export async function foo / function foo
        const fnMatch = t.match(
            /^(export\s+)?(default\s+)?(async\s+)?function\s+(\w+)/
        );
        if (fnMatch?.[4]) {
            functions.push({
                name: fnMatch[4],
                startLine: i + 1,
                isExported: !!fnMatch[1],
                isAsync: !!fnMatch[3],
            });
            return;
        }

        // export const foo = async () => / export const foo = function
        const arrowMatch = t.match(
            /^(export\s+)?(?:const|let)\s+(\w+)\s*=\s*(async\s+)?(?:\(|function)/
        );
        if (arrowMatch?.[2]) {
            functions.push({
                name: arrowMatch[2],
                startLine: i + 1,
                isExported: !!arrowMatch[1],
                isAsync: !!arrowMatch[3],
            });
        }
    });

    return functions;
};

const extractClasses = (lines: string[]): ASTSummary["classes"] => {
    const classes: ASTSummary["classes"] = [];
    let currentClass: (typeof classes)[0] | null = null;
    let braceDepth = 0;

    const RESERVED = new Set(["if", "for", "while", "switch", "catch", "constructor"]);

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//")) return;

        const classMatch = t.match(/^(export\s+)?(?:abstract\s+)?class\s+(\w+)/);
        if (classMatch?.[2]) {
            currentClass = {
                name: classMatch[2],
                startLine: i + 1,
                isExported: !!classMatch[1],
                methods: [],
            };
            classes.push(currentClass);
            braceDepth = 0;
        }

        if (currentClass) {
            for (const ch of line) {
                if (ch === "{") braceDepth++;
                if (ch === "}") braceDepth--;
            }
            if (braceDepth <= 0 && i > currentClass.startLine - 1) {
                currentClass = null;
                return;
            }
            const methodMatch = t.match(
                /^(?:(?:public|private|protected|static|async|override)\s+)*(\w+)\s*\(/
            );
            if (methodMatch?.[1] && !RESERVED.has(methodMatch[1])) {
                currentClass?.methods.push(methodMatch[1]);
            }
        }
    });

    return classes;
};

const extractImports = (lines: string[]): ASTSummary["imports"] => {
    const imports: ASTSummary["imports"] = [];

    lines.forEach((line) => {
        const t = line.trim();

        // import { a, b } from 'path'
        const namedMatch = t.match(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
        if (namedMatch?.[1] && namedMatch[2]) {
            const specifiers = namedMatch[1]
                .split(",")
                .map((s) => s.trim().replace(/\s+as\s+\w+$/, "").trim())
                .filter(Boolean);
            imports.push({ source: namedMatch[2], specifiers, isLocal: namedMatch[2].startsWith(".") });
            return;
        }

        // import Default, { a } from 'path'
        const mixedMatch = t.match(/^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
        if (mixedMatch?.[1] && mixedMatch[2] && mixedMatch[3]) {
            const extra = mixedMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
            imports.push({ source: mixedMatch[3], specifiers: [mixedMatch[1], ...extra], isLocal: mixedMatch[3].startsWith(".") });
            return;
        }

        // import Default from 'path'
        const defaultMatch = t.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
        if (defaultMatch?.[1] && defaultMatch[2]) {
            imports.push({ source: defaultMatch[2], specifiers: [defaultMatch[1]], isLocal: defaultMatch[2].startsWith(".") });
            return;
        }

        // import 'path'
        const sideMatch = t.match(/^import\s+['"]([^'"]+)['"]/);
        if (sideMatch?.[1]) {
            imports.push({ source: sideMatch[1], specifiers: [], isLocal: sideMatch[1].startsWith(".") });
        }
    });

    return imports;
};

export const buildAST = async (params: {
    changedFiles: string[];
    repoLocalPath: string;
}): Promise<ASTSummary[]> => {
    const results: ASTSummary[] = [];

    await Promise.all(
        params.changedFiles
            .filter((f) => SUPPORTED_EXTS.has(extname(f)))
            .map(async (filePath) => {
                try {
                    const absPath = join(params.repoLocalPath, filePath);
                    await access(absPath);
                    const content = await readFile(absPath, "utf-8");
                    const lines = content.split("\n");

                    results.push({
                        filePath,
                        language: "typescript",
                        functions: extractFunctions(lines),
                        classes: extractClasses(lines),
                        imports: extractImports(lines),
                    });
                } catch {
                    // file deleted in this PR or unreadable — skip
                }
            })
    );

    return results;
};
