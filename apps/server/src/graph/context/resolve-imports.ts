import { readFile, access } from "fs/promises";
import { join, dirname, extname, resolve } from "path";
import type { ImportSource } from "../review.state";

const SUPPORTED_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"];
const MAX_SOURCE_CHARS = 4_000;

const resolveLocalPath = async (
    importPath: string,
    fromFile: string,
    repoRoot: string
): Promise<string | null> => {
    const fromDir = dirname(join(repoRoot, fromFile));
    const base = resolve(fromDir, importPath);

    const candidates = [
        base,
        ...SUPPORTED_EXTS.map((ext) => base + ext),
        ...SUPPORTED_EXTS.map((ext) => join(base, "index" + ext)),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch { /* try next */ }
    }

    return null;
};

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
                    const absPath = join(params.repoLocalPath, filePath);
                    const content = await readFile(absPath, "utf-8");

                    // Match  import ... from './path'  (single-line only)
                    const importPattern = /^import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/gm;
                    let match: RegExpExecArray | null;

                    while ((match = importPattern.exec(content)) !== null) {
                        const imp = match[1];
                        if (!imp) continue;

                        // Only local relative imports
                        if (!imp.startsWith(".")) continue;

                        const cacheKey = `${filePath}::${imp}`;
                        if (seen.has(cacheKey)) continue;
                        seen.add(cacheKey);

                        const resolvedAbsPath = await resolveLocalPath(imp, filePath, params.repoLocalPath);
                        if (!resolvedAbsPath) continue;

                        // Skip if import is one of the changed files (already in diff)
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
                } catch { /* changed file deleted in PR */ }
            })
    );

    return results;
};
