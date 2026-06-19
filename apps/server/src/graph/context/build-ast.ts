import { readFile, access } from "fs/promises";
import { join, extname } from "path";
import type { ASTSummary } from "../../types/review-context.type";

const TS_JS_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);
const PYTHON_EXTS = new Set([".py"]);
const RUST_EXTS = new Set([".rs"]);
const SUPPORTED_EXTS = new Set([...TS_JS_EXTS, ...PYTHON_EXTS, ...RUST_EXTS]);

const getLanguage = (ext: string): string => {
    if (TS_JS_EXTS.has(ext)) return "typescript";
    if (PYTHON_EXTS.has(ext)) return "python";
    if (RUST_EXTS.has(ext)) return "rust";
    return "unknown";
};

// ── TypeScript / JavaScript 

const extractFunctions = (lines: string[]): ASTSummary["functions"] => {
    const functions: ASTSummary["functions"] = [];

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//") || t.startsWith("*")) return;

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

        const namedMatch = t.match(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
        if (namedMatch?.[1] && namedMatch[2]) {
            const specifiers = namedMatch[1]
                .split(",")
                .map((s) => s.trim().replace(/\s+as\s+\w+$/, "").trim())
                .filter(Boolean);
            imports.push({ source: namedMatch[2], specifiers, isLocal: namedMatch[2].startsWith(".") });
            return;
        }

        const mixedMatch = t.match(/^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
        if (mixedMatch?.[1] && mixedMatch[2] && mixedMatch[3]) {
            const extra = mixedMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
            imports.push({ source: mixedMatch[3], specifiers: [mixedMatch[1], ...extra], isLocal: mixedMatch[3].startsWith(".") });
            return;
        }

        const defaultMatch = t.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
        if (defaultMatch?.[1] && defaultMatch[2]) {
            imports.push({ source: defaultMatch[2], specifiers: [defaultMatch[1]], isLocal: defaultMatch[2].startsWith(".") });
            return;
        }

        const sideMatch = t.match(/^import\s+['"]([^'"]+)['"]/);
        if (sideMatch?.[1]) {
            imports.push({ source: sideMatch[1], specifiers: [], isLocal: sideMatch[1].startsWith(".") });
        }
    });

    return imports;
};

// ── Python 

const extractFunctionsPython = (lines: string[]): ASTSummary["functions"] => {
    const functions: ASTSummary["functions"] = [];

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("#")) return;

        const m = t.match(/^(async\s+)?def\s+(\w+)\s*\(/);
        if (m?.[2]) {
            functions.push({
                name: m[2],
                startLine: i + 1,
                isExported: !m[2].startsWith("_"),
                isAsync: !!m[1],
            });
        }
    });

    return functions;
};

const extractClassesPython = (lines: string[]): ASTSummary["classes"] => {
    const classes: ASTSummary["classes"] = [];
    let currentClass: (typeof classes)[0] | null = null;
    let classIndent = 0;

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("#")) return;

        const classMatch = t.match(/^class\s+(\w+)/);
        if (classMatch?.[1]) {
            currentClass = {
                name: classMatch[1],
                startLine: i + 1,
                isExported: !classMatch[1].startsWith("_"),
                methods: [],
            };
            classes.push(currentClass);
            classIndent = line.length - t.length;
            return;
        }

        if (currentClass) {
            const indent = line.length - t.length;
            if (t.length > 0 && indent <= classIndent && i > currentClass.startLine - 1) {
                currentClass = null;
                return;
            }
            const methodMatch = t.match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
            if (methodMatch?.[1]) {
                currentClass?.methods.push(methodMatch[1]);
            }
        }
    });

    return classes;
};

const extractImportsPython = (lines: string[]): ASTSummary["imports"] => {
    const imports: ASTSummary["imports"] = [];

    lines.forEach((line) => {
        const t = line.trim();
        if (t.startsWith("#")) return;

        // from x.y import a, b  /  from .x import a
        const fromMatch = t.match(/^from\s+([\w.]+)\s+import\s+(.+)/);
        if (fromMatch?.[1] && fromMatch[2]) {
            const specifiers = fromMatch[2]
                .replace(/[()]/g, "")
                .split(",")
                .map((s) => s.trim().split(/\s+as\s+/)[0]?.trim() ?? "")
                .filter(Boolean);
            const source = fromMatch[1];
            imports.push({ source, specifiers, isLocal: source.startsWith(".") });
            return;
        }

        // import x, y
        const importMatch = t.match(/^import\s+(.+)/);
        if (importMatch?.[1]) {
            const specifiers = importMatch[1]
                .split(",")
                .map((s) => s.trim().split(/\s+as\s+/)[0]?.trim() ?? "")
                .filter(Boolean);
            imports.push({ source: specifiers[0] ?? "", specifiers, isLocal: false });
        }
    });

    return imports;
};

// ── Rust ──────────────────────────────────────────────────────────────────────

const extractFunctionsRust = (lines: string[]): ASTSummary["functions"] => {
    const functions: ASTSummary["functions"] = [];

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//")) return;

        const m = t.match(/^(pub(?:\([^)]*\))?\s+)?(async\s+)?fn\s+(\w+)/);
        if (m?.[3]) {
            functions.push({
                name: m[3],
                startLine: i + 1,
                isExported: !!m[1],
                isAsync: !!m[2],
            });
        }
    });

    return functions;
};

const extractClassesRust = (lines: string[]): ASTSummary["classes"] => {
    const classes: ASTSummary["classes"] = [];
    let currentClass: (typeof classes)[0] | null = null;
    let braceDepth = 0;

    lines.forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//")) return;

        // struct / enum / trait declarations
        const structMatch = t.match(/^(?:pub(?:\([^)]*\))?\s+)?(?:struct|enum|trait)\s+(\w+)/);
        if (structMatch?.[1]) {
            currentClass = {
                name: structMatch[1],
                startLine: i + 1,
                isExported: t.startsWith("pub"),
                methods: [],
            };
            classes.push(currentClass);
            braceDepth = 0;
        }

        // impl blocks — associate methods with the impl type
        if (!structMatch) {
            const implMatch = t.match(/^impl(?:<[^>]*>)?\s+(?:\w+\s+for\s+)?(\w+)/);
            if (implMatch?.[1]) {
                let existing = classes.find((c) => c.name === implMatch[1]);
                if (!existing) {
                    existing = { name: implMatch[1], startLine: i + 1, isExported: false, methods: [] };
                    classes.push(existing);
                }
                currentClass = existing;
                braceDepth = 0;
            }
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
            const methodMatch = t.match(/^(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+(\w+)/);
            if (methodMatch?.[1]) {
                currentClass?.methods.push(methodMatch[1]);
            }
        }
    });

    return classes;
};

const extractImportsRust = (lines: string[]): ASTSummary["imports"] => {
    const imports: ASTSummary["imports"] = [];

    lines.forEach((line) => {
        const t = line.trim();
        if (t.startsWith("//")) return;

        // use std::collections::HashMap;
        // use crate::foo::{Bar, Baz};
        const useMatch = t.match(/^use\s+([\w:]+)(?:::\{([^}]+)\})?;/);
        if (useMatch?.[1]) {
            const source = useMatch[1];
            const specifiers = useMatch[2]
                ? useMatch[2].split(",").map((s) => s.trim()).filter(Boolean)
                : [source.split("::").pop() ?? source];
            const isLocal =
                source.startsWith("crate::") ||
                source.startsWith("super::") ||
                source.startsWith("self::");
            imports.push({ source, specifiers, isLocal });
        }
    });

    return imports;
};

// ── Entry point ───────────────────────────────────────────────────────────────

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
                    const ext = extname(filePath);
                    const absPath = join(params.repoLocalPath, filePath);
                    await access(absPath);
                    const content = await readFile(absPath, "utf-8");
                    const lines = content.split("\n");

                    let functions: ASTSummary["functions"];
                    let classes: ASTSummary["classes"];
                    let imports: ASTSummary["imports"];

                    if (PYTHON_EXTS.has(ext)) {
                        functions = extractFunctionsPython(lines);
                        classes = extractClassesPython(lines);
                        imports = extractImportsPython(lines);
                    } else if (RUST_EXTS.has(ext)) {
                        functions = extractFunctionsRust(lines);
                        classes = extractClassesRust(lines);
                        imports = extractImportsRust(lines);
                    } else {
                        functions = extractFunctions(lines);
                        classes = extractClasses(lines);
                        imports = extractImports(lines);
                    }

                    results.push({
                        filePath,
                        language: getLanguage(ext),
                        functions,
                        classes,
                        imports,
                    });
                } catch {
                    // file deleted in this PR or unreadable — skip
                }
            })
    );

    return results;
};
