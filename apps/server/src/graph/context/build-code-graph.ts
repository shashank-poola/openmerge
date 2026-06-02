import { readFile, readdir } from "fs/promises";
import { join, extname, relative } from "path";
import type { CodeGraphNode } from "../review.state";

const SUPPORTED_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", ".next", "coverage"]);

const BUILTIN_CALLS = new Set([
    "if", "for", "while", "switch", "catch", "return", "new", "typeof",
    "instanceof", "await", "console", "Math", "JSON", "Object", "Array",
    "Promise", "Error", "parseInt", "parseFloat", "String", "Number", "Boolean",
    "setTimeout", "setInterval", "clearTimeout", "clearInterval",
]);

// ─── helpers ─────────────────────────────────────────────────────────────────

const findFunctionDefs = (code: string): Array<{ name: string; startLine: number }> => {
    const defs: Array<{ name: string; startLine: number }> = [];
    code.split("\n").forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//") || t.startsWith("*")) return;

        const m =
            t.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/) ||
            t.match(/^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?(?:\(|function)/);

        if (m?.[1]) defs.push({ name: m[1], startLine: i + 1 });
    });
    return defs;
};

const getFunctionBody = (lines: string[], startLine: number): string => {
    let depth = 0;
    let started = false;
    const body: string[] = [];

    for (let i = startLine - 1; i < Math.min(lines.length, startLine + 300); i++) {
        const line = lines[i] ?? "";
        body.push(line);
        for (const ch of line) {
            if (ch === "{") { depth++; started = true; }
            if (ch === "}") depth--;
        }
        if (started && depth <= 0) break;
    }

    return body.join("\n");
};

const extractCalls = (body: string): string[] => {
    const calls = new Set<string>();
    const re = /\b([a-zA-Z_$][\w$]*)\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
        const name = m[1];
        if (name && !BUILTIN_CALLS.has(name)) calls.add(name);
    }
    return [...calls];
};

const walkDir = async (dir: string, acc: string[] = []): Promise<string[]> => {
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const e of entries) {
            if (e.name.startsWith(".") || SKIP_DIRS.has(e.name)) continue;
            const full = join(dir, e.name);
            if (e.isDirectory()) await walkDir(full, acc);
            else if (SUPPORTED_EXTS.has(extname(e.name))) acc.push(full);
        }
    } catch { /* unreadable */ }
    return acc;
};

// ─── main ─────────────────────────────────────────────────────────────────────

export const buildCodeGraph = async (params: {
    changedFiles: string[];
    repoLocalPath: string;
}): Promise<CodeGraphNode[]> => {
    // fn name → first definition file (relative path)
    const defIndex = new Map<string, string>();
    // inverted index: fn name → who calls it
    const callerIndex = new Map<string, Array<{ functionName: string; filePath: string; line: number }>>();

    const allFiles = await walkDir(params.repoLocalPath);

    // Single pass over repo — build both indexes
    await Promise.all(
        allFiles.slice(0, 400).map(async (absPath) => {
            try {
                const relPath = relative(params.repoLocalPath, absPath);
                const content = await readFile(absPath, "utf-8");
                const lines = content.split("\n");
                const defs = findFunctionDefs(content);

                for (const def of defs) {
                    if (!defIndex.has(def.name)) defIndex.set(def.name, relPath);

                    const body = getFunctionBody(lines, def.startLine);
                    for (const calledFn of extractCalls(body)) {
                        if (calledFn === def.name) continue;
                        const existing = callerIndex.get(calledFn) ?? [];
                        existing.push({ functionName: def.name, filePath: relPath, line: def.startLine });
                        callerIndex.set(calledFn, existing);
                    }
                }
            } catch { /* skip */ }
        })
    );

    // Build graph nodes only for changed files
    const graph: CodeGraphNode[] = [];

    for (const filePath of params.changedFiles) {
        if (!SUPPORTED_EXTS.has(extname(filePath))) continue;
        try {
            const absPath = join(params.repoLocalPath, filePath);
            const content = await readFile(absPath, "utf-8");
            const lines = content.split("\n");
            const defs = findFunctionDefs(content);

            for (const def of defs) {
                const body = getFunctionBody(lines, def.startLine);
                const calls = extractCalls(body)
                    .filter((n) => n !== def.name)
                    .map((name) => ({
                        name,
                        resolvedFile: defIndex.get(name) as string | undefined,
                    }))
                    .slice(0, 20);

                const calledBy = (callerIndex.get(def.name) ?? []).slice(0, 15);
                graph.push({ filePath, functionName: def.name, calls, calledBy });
            }
        } catch { /* file deleted in PR */ }
    }

    return graph;
};
