import { readFile, access } from "fs/promises";
import { join, dirname, extname, resolve } from "path";
import type { ImportSource } from "../../types/review-context.type";

const TS_JS_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"];
const PYTHON_EXTS = [".py"];
const SUPPORTED_EXTS = [...TS_JS_EXTS, ...PYTHON_EXTS];
const MAX_SOURCE_CHARS = 4_000;

// ── TS/JS local path resolution ───────────────────────────────────────────────

const resolveLocalPathTS = async (
    importPath: string,
    fromFile: string,
    repoRoot: string
): Promise<string | null> => {
    const fromDir = dirname(join(repoRoot, fromFile));
    const base = resolve(fromDir, importPath);

    const candidates = [
        base,
        ...TS_JS_EXTS.map((ext) => base + ext),
        ...TS_JS_EXTS.map((ext) => join(base, "index" + ext)),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch { /* try next */ }
    }

    return null;
};

// ── Python local path resolution ──────────────────────────────────────────────
// Handles relative imports: `from .module import x`, `from ..utils import y`

const resolveLocalPathPython = async (
    importPath: string, // e.g. ".module" or "..utils.helper"
    fromFile: string,
    repoRoot: string
): Promise<string | null> => {
    const fromDir = dirname(join(repoRoot, fromFile));

    let dotCount = 0;
    let rest = importPath;
    while (rest.startsWith(".")) { dotCount++; rest = rest.slice(1); }

    // Walk up dotCount-1 directories (1 dot = current package, 2 dots = parent, etc.)
    let baseDir = fromDir;
    for (let i = 1; i < dotCount; i++) baseDir = dirname(baseDir);

    if (!rest) {
        // `from . import x` — package __init__.py
        const candidate = join(baseDir, "__init__.py");
        try { await access(candidate); return candidate; } catch { return null; }
    }

    const parts = rest.split(".");
    const base = join(baseDir, ...parts);
    const candidates = [base + ".py", join(base, "__init__.py")];

    for (const candidate of candidates) {
        try { await access(candidate); return candidate; } catch { /* try next */ }
    }

    return null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const isLocalPythonImport = (source: string): boolean => source.startsWith(".");

const extractPythonRelativeImports = (content: string): string[] => {
    const sources: string[] = [];
    // from .x import y  /  from ..x import y
    const pattern = /^from\s+(\.+[\w.]*)\s+import\s+/gm;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(content)) !== null) {
        if (m[1]) sources.push(m[1]);
    }
    return sources;
};

// ── Entry point ───────────────────────────────────────────────────────────────

export const resolveImports = async (params: {
    changedFiles: string[];
    repoLocalPath: string;
}): Promise<ImportSource[]> => {
    const results: ImportSource[] = [];
    const seen = new Set<string>();

    await Promise.all(
        params.changedFiles
            .filter((f) => SUPPORTED_EXTS.includes(extname(f)))
            .map(async (filePath) => {
                try {
                    const ext = extname(filePath);
                    const absPath = join(params.repoLocalPath, filePath);
                    const content = await readFile(absPath, "utf-8");

                    if (PYTHON_EXTS.includes(ext)) {
                        // Python: resolve relative imports only
                        const importSources = extractPythonRelativeImports(content);

                        for (const imp of importSources) {
                            if (!isLocalPythonImport(imp)) continue;

                            const cacheKey = `${filePath}::${imp}`;
                            if (seen.has(cacheKey)) continue;
                            seen.add(cacheKey);

                            const resolvedAbsPath = await resolveLocalPathPython(imp, filePath, params.repoLocalPath);
                            if (!resolvedAbsPath) continue;

                            if (params.changedFiles.some((f) => resolvedAbsPath.endsWith(f))) continue;

                            const resolvedRelPath = resolvedAbsPath
                                .replace(resolve(params.repoLocalPath) + "/", "")
                                .replace(resolve(params.repoLocalPath) + "\\", "");

                            try {
                                const sourceCode = await readFile(resolvedAbsPath, "utf-8");
                                results.push({
                                    importPath: imp,
                                    resolvedPath: resolvedRelPath,
                                    sourceCode: sourceCode.slice(0, MAX_SOURCE_CHARS),
                                    usedInFile: filePath,
                                });
                            } catch { /* unreadable */ }
                        }
                    } else {
                        // TS/JS: resolve relative imports
                        const importPattern = /^import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/gm;
                        let match: RegExpExecArray | null;

                        while ((match = importPattern.exec(content)) !== null) {
                            const imp = match[1];
                            if (!imp) continue;
                            if (!imp.startsWith(".")) continue;

                            const cacheKey = `${filePath}::${imp}`;
                            if (seen.has(cacheKey)) continue;
                            seen.add(cacheKey);

                            const resolvedAbsPath = await resolveLocalPathTS(imp, filePath, params.repoLocalPath);
                            if (!resolvedAbsPath) continue;

                            if (params.changedFiles.some((f) => resolvedAbsPath.endsWith(f))) continue;

                            const resolvedRelPath = resolvedAbsPath
                                .replace(resolve(params.repoLocalPath) + "/", "")
                                .replace(resolve(params.repoLocalPath) + "\\", "");

                            try {
                                const sourceCode = await readFile(resolvedAbsPath, "utf-8");
                                results.push({
                                    importPath: imp,
                                    resolvedPath: resolvedRelPath,
                                    sourceCode: sourceCode.slice(0, MAX_SOURCE_CHARS),
                                    usedInFile: filePath,
                                });
                            } catch { /* unreadable */ }
                        }
                    }
                } catch { /* changed file deleted in PR */ }
            })
    );

    return results;
};
