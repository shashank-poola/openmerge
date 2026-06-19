import { readFile, readdir } from "fs/promises";
import { join, extname, relative } from "path";
import type { CodeGraphNode } from "../../types/review-context.type";

const TS_JS_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);
const PYTHON_EXTS = new Set([".py"]);
const RUST_EXTS = new Set([".rs"]);
const SUPPORTED_EXTS = new Set([...TS_JS_EXTS, ...PYTHON_EXTS, ...RUST_EXTS]);
const SKIP_DIRS = new Set([
    "node_modules", "dist", "build", ".git", ".next", "coverage",
    "__pycache__", "target", ".venv", "venv", ".cargo",
]);

const BUILTIN_CALLS = new Set([
    "if", "for", "while", "switch", "catch", "return", "new", "typeof",
    "instanceof", "await", "console", "Math", "JSON", "Object", "Array",
    "Promise", "Error", "parseInt", "parseFloat", "String", "Number", "Boolean",
    "setTimeout", "setInterval", "clearTimeout", "clearInterval",
    // Python builtins
    "print", "len", "range", "enumerate", "zip", "map", "filter", "sorted",
    "list", "dict", "set", "tuple", "type", "isinstance", "hasattr", "getattr",
    "setattr", "super", "repr", "str", "int", "float", "bool", "open",
    // Rust common
    "println", "eprintln", "panic", "vec", "Some", "None", "Ok", "Err",
]);

// ── Function definition finders ───────────────────────────────────────────────

const findFunctionDefsTS = (code: string): Array<{ name: string; startLine: number }> => {
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

const findFunctionDefsPython = (code: string): Array<{ name: string; startLine: number }> => {
    const defs: Array<{ name: string; startLine: number }> = [];
    code.split("\n").forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("#")) return;
        const m = t.match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
        if (m?.[1]) defs.push({ name: m[1], startLine: i + 1 });
    });
    return defs;
};

const findFunctionDefsRust = (code: string): Array<{ name: string; startLine: number }> => {
    const defs: Array<{ name: string; startLine: number }> = [];
    code.split("\n").forEach((line, i) => {
        const t = line.trimStart();
        if (t.startsWith("//")) return;
        const m = t.match(/^(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+(\w+)/);
        if (m?.[1]) defs.push({ name: m[1], startLine: i + 1 });
    });
    return defs;
};

const findFunctionDefs = (
    code: string,
    ext: string
): Array<{ name: string; startLine: number }> => {
    if (PYTHON_EXTS.has(ext)) return findFunctionDefsPython(code);
    if (RUST_EXTS.has(ext)) return findFunctionDefsRust(code);
    return findFunctionDefsTS(code);
};

// ── Function body extractors ──────────────────────────────────────────────────

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

// Python uses indentation — collect lines until indent returns to base level
const getPythonFunctionBody = (lines: string[], startLine: number): string => {
    const body: string[] = [lines[startLine - 1] ?? ""];
    const defLine = lines[startLine - 1] ?? "";
    const baseIndent = defLine.length - defLine.trimStart().length;

    for (let i = startLine; i < Math.min(lines.length, startLine + 200); i++) {
        const line = lines[i] ?? "";
        const trimmed = line.trimStart();
        if (trimmed.length === 0) { body.push(line); continue; }
        const indent = line.length - trimmed.length;
        if (indent <= baseIndent) break;
        body.push(line);
    }

    return body.join("\n");
};

const getFunctionBodyForExt = (lines: string[], startLine: number, ext: string): string => {
    if (PYTHON_EXTS.has(ext)) return getPythonFunctionBody(lines, startLine);
    return getFunctionBody(lines, startLine);
};

// ── Call extractor (works for TS/JS/Python/Rust) ─────────────────────────────

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

// ── Directory walker ──────────────────────────────────────────────────────────

const walkDir = async (dir: string, acc: string[] = []): Promise<string[]> => {
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const e of entries) {
            if (e.name.startsWith(".") || SKIP_DIRS.has(e.name)) continue;
            const full = join(dir, e.name);
            if (e.isDirectory()) await walkDir(full, acc);
            else if (SUPPORTED_EXTS.has(extname(e.name))) acc.push(full);
        }
    } catch { /* unreadable dir */ }
    return acc;
};

// ── Entry point ───────────────────────────────────────────────────────────────

export const buildCodeGraph = async (params: {
    changedFiles: string[];
    repoLocalPath: string;
}): Promise<CodeGraphNode[]> => {
    const defIndex = new Map<string, string>();
    const callerIndex = new Map<string, Array<{ functionName: string; filePath: string; line: number }>>();

    const allFiles = await walkDir(params.repoLocalPath);

    await Promise.all(
        allFiles.slice(0, 400).map(async (absPath) => {
            try {
                const ext = extname(absPath);
                const relPath = relative(params.repoLocalPath, absPath);
                const content = await readFile(absPath, "utf-8");
                const lines = content.split("\n");
                const defs = findFunctionDefs(content, ext);

                for (const def of defs) {
                    if (!defIndex.has(def.name)) defIndex.set(def.name, relPath);

                    const body = getFunctionBodyForExt(lines, def.startLine, ext);
                    for (const calledFn of extractCalls(body)) {
                        if (calledFn === def.name) continue;
                        const existing = callerIndex.get(calledFn) ?? [];
                        existing.push({ functionName: def.name, filePath: relPath, line: def.startLine });
                        callerIndex.set(calledFn, existing);
                    }
                }
            } catch { /* skip unreadable */ }
        })
    );

    const graph: CodeGraphNode[] = [];

    for (const filePath of params.changedFiles) {
        const ext = extname(filePath);
        if (!SUPPORTED_EXTS.has(ext)) continue;
        try {
            const absPath = join(params.repoLocalPath, filePath);
            const content = await readFile(absPath, "utf-8");
            const lines = content.split("\n");
            const defs = findFunctionDefs(content, ext);

            for (const def of defs) {
                const body = getFunctionBodyForExt(lines, def.startLine, ext);
                const calls = extractCalls(body)
                    .filter((n) => n !== def.name)
                    .map((name) => ({ name, resolvedFile: defIndex.get(name) as string | undefined }))
                    .slice(0, 20);

                const calledBy = (callerIndex.get(def.name) ?? []).slice(0, 15);
                graph.push({ filePath, functionName: def.name, calls, calledBy });
            }
        } catch { /* file deleted in PR */ }
    }

    return graph;
};
