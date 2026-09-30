/**
 * Deterministic evidence extracted from a unified Git diff. These types are
 * intentionally independent of the agent output schema so they can be used at
 * the review boundary without changing the persisted comment contract.
 */
export type DiffLine = {
  kind: "added" | "context" | "removed";
  content: string;
  oldLine: number | null;
  newLine: number | null;
};

export type DiffHunk = {
  id: string;
  header: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
  complete: boolean;
  rendered: string;
};

export type DiffFile = {
  path: string | null;
  previousPath: string | null;
  status: "supported" | "binary" | "unsupported";
  unsupportedReason?: string;
  header: string;
  hunks: DiffHunk[];
};

export type DiffEvidenceIndex = {
  files: DiffFile[];
  changedPaths: ReadonlySet<string>;
  /** Added anchors that exist in the source diff but were omitted from the review view. */
  unreviewedAddedLines: ReadonlyMap<string, ReadonlySet<number>>;
};

export type CompleteHunkSelection = {
  view: string;
  index: DiffEvidenceIndex;
  coverage: {
    totalHunks: number;
    includedHunks: number;
    omittedHunks: number;
    totalFiles: number;
    includedFiles: string[];
    omittedFiles: string[];
  };
};

export type GroundingCandidate = {
  filePath: string;
  line: number;
  startLine?: number;
  currentCode?: string;
};

export type CandidateGrounding =
  | {
      status: "grounded";
      path: string;
      hunkId: string;
      startLine: number;
      endLine: number;
    }
  | {
      status: "rejected";
      reason:
        | "invalid-path"
        | "path-not-changed"
        | "unsupported-file"
        | "missing-current-code"
        | "invalid-line-range"
        | "anchor-not-added"
        | "anchor-not-reviewed"
        | "code-not-in-hunk"
        | "code-mismatch";
    };

type MutableDiffFile = DiffFile;

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?:.*)$/;

const normalizeLineEndings = (value: string): string =>
  value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const decodeGitPath = (value: string): string => {
  if (!value.startsWith('"') || !value.endsWith('"')) return value;

  let decoded = "";
  for (let index = 1; index < value.length - 1; index += 1) {
    const char = value[index];
    if (char !== "\\") {
      decoded += char;
      continue;
    }

    const escaped = value[index + 1];
    if (escaped === undefined) break;
    if (/^[0-7]$/.test(escaped)) {
      const octal = value.slice(index + 1, index + 4);
      if (/^[0-7]{3}$/.test(octal)) {
        decoded += String.fromCharCode(Number.parseInt(octal, 8));
        index += 3;
        continue;
      }
    }

    const replacements: Record<string, string> = {
      a: "\u0007",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
      v: "\v",
      "\\": "\\",
      '"': '"',
    };
    decoded += replacements[escaped] ?? escaped;
    index += 1;
  }
  return decoded;
};

const tokenizeDiffHeader = (value: string): string[] => {
  const tokens: string[] = [];
  let token = "";
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '"') quoted = !quoted;
    if (char === " " && !quoted) {
      if (token) {
        tokens.push(decodeGitPath(token));
        token = "";
      }
      continue;
    }
    token += char;
  }
  if (token) tokens.push(decodeGitPath(token));
  return tokens;
};

const canonicalRepositoryPath = (
  value: string | null | undefined,
): string | null => {
  if (!value || value === "/dev/null") return null;

  const decoded = decodeGitPath(value);
  const path = decoded;

  if (!path || path.startsWith("/") || path.includes("\0")) return null;
  if (
    path
      .split("/")
      .some((segment) => segment === "." || segment === ".." || !segment)
  )
    return null;
  return path;
};

/** Returns a repository-relative path from an a/ or b/ diff marker. */
export const canonicalChangedPath = (
  value: string | null | undefined,
): string | null => {
  if (!value || value === "/dev/null") return null;
  const decoded = decodeGitPath(value);
  const withoutMarker =
    decoded.startsWith("a/") || decoded.startsWith("b/")
      ? decoded.slice(2)
      : decoded;
  return canonicalRepositoryPath(withoutMarker);
};

const pathFromFileMarker = (line: string): string | null => {
  const markerPath = line.slice(4).split("\t", 1)[0] ?? "";
  return canonicalChangedPath(markerPath);
};

const finaliseHunk = (file: MutableDiffFile, hunk: DiffHunk | null): void => {
  if (!hunk) return;
  const oldLines = hunk.lines.filter((line) => line.kind !== "added").length;
  const newLines = hunk.lines.filter((line) => line.kind !== "removed").length;
  hunk.complete =
    hunk.complete && oldLines === hunk.oldCount && newLines === hunk.newCount;
  hunk.rendered = [
    hunk.header,
    ...hunk.lines.map((line) => {
      const prefix =
        line.kind === "added" ? "+" : line.kind === "removed" ? "-" : " ";
      return `${prefix}${line.content}`;
    }),
  ].join("\n");
  file.hunks.push(hunk);
  if (!hunk.complete) {
    file.status = "unsupported";
    file.unsupportedReason = "malformed-hunk";
  }
};

const finaliseFile = (
  files: MutableDiffFile[],
  file: MutableDiffFile | null,
  hunk: DiffHunk | null,
): void => {
  if (!file) return;
  finaliseHunk(file, hunk);
  if (file.previousPath === file.path) file.previousPath = null;
  if (!file.path && file.status === "supported") {
    file.status = "unsupported";
    file.unsupportedReason = "missing-current-path";
  }
  files.push(file);
};

/**
 * Parses only ordinary unified Git diffs. Binary, combined, and malformed
 * sections are retained as unsupported evidence so callers fail closed.
 */
export const parseUnifiedDiff = (diff: string): DiffEvidenceIndex => {
  const files: MutableDiffFile[] = [];
  const normalizedDiff = normalizeLineEndings(diff);
  const lines = normalizedDiff.split("\n");
  if (normalizedDiff.endsWith("\n")) lines.pop();
  let file: MutableDiffFile | null = null;
  let hunk: DiffHunk | null = null;
  let oldCursor = 0;
  let newCursor = 0;

  const createFile = (
    oldPath: string | null,
    newPath: string | null,
    header: string,
    status: DiffFile["status"] = "supported",
  ): MutableDiffFile => {
    finaliseFile(files, file, hunk);
    hunk = null;
    return {
      path: newPath,
      previousPath: oldPath && oldPath !== newPath ? oldPath : null,
      status,
      header,
      hunks: [],
    };
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (line.startsWith("diff --git ")) {
      const paths = tokenizeDiffHeader(line.slice("diff --git ".length));
      file = createFile(
        canonicalChangedPath(paths[0]),
        canonicalChangedPath(paths[1]),
        line,
      );
      continue;
    }
    if (line.startsWith("diff --cc ") || line.startsWith("diff --combined ")) {
      const path = canonicalChangedPath(
        line.startsWith("diff --cc ")
          ? line.slice("diff --cc ".length)
          : line.slice("diff --combined ".length),
      );
      file = createFile(path, path, line, "unsupported");
      if (file) file.unsupportedReason = "combined-diff";
      continue;
    }
    if (!file) continue;

    if (line === "GIT binary patch" || line.startsWith("Binary files ")) {
      finaliseHunk(file, hunk);
      hunk = null;
      file.status = "binary";
      file.unsupportedReason = "binary-diff";
      continue;
    }
    if (line.startsWith("rename from ")) {
      file.previousPath = canonicalRepositoryPath(
        line.slice("rename from ".length),
      );
      continue;
    }
    if (line.startsWith("rename to ")) {
      file.path = canonicalRepositoryPath(line.slice("rename to ".length));
      continue;
    }
    if (line.startsWith("--- ")) {
      file.previousPath = pathFromFileMarker(line);
      continue;
    }
    if (line.startsWith("+++ ")) {
      file.path = pathFromFileMarker(line);
      continue;
    }

    const hunkMatch = line.match(HUNK_HEADER);
    if (hunkMatch) {
      finaliseHunk(file, hunk);
      const oldStart = Number(hunkMatch[1]);
      const oldCount = Number(hunkMatch[2] ?? "1");
      const newStart = Number(hunkMatch[3]);
      const newCount = Number(hunkMatch[4] ?? "1");
      hunk = {
        id: `${file.path ?? "unknown"}:${file.hunks.length + 1}`,
        header: line,
        oldStart,
        oldCount,
        newStart,
        newCount,
        lines: [],
        complete: true,
        rendered: "",
      };
      oldCursor = oldStart;
      newCursor = newStart;
      continue;
    }
    if (!hunk) continue;
    if (line === "\\ No newline at end of file") continue;

    const marker = line[0];
    const content = line.slice(1);
    if (marker === "+") {
      hunk.lines.push({
        kind: "added",
        content,
        oldLine: null,
        newLine: newCursor,
      });
      newCursor += 1;
    } else if (marker === "-") {
      hunk.lines.push({
        kind: "removed",
        content,
        oldLine: oldCursor,
        newLine: null,
      });
      oldCursor += 1;
    } else if (marker === " ") {
      hunk.lines.push({
        kind: "context",
        content,
        oldLine: oldCursor,
        newLine: newCursor,
      });
      oldCursor += 1;
      newCursor += 1;
    } else {
      hunk.complete = false;
    }
  }
  finaliseFile(files, file, hunk);

  return {
    files,
    changedPaths: new Set(
      files.flatMap((entry) => (entry.path ? [entry.path] : [])),
    ),
    unreviewedAddedLines: new Map(),
  };
};

const withHunks = (file: DiffFile, hunks: DiffHunk[]): DiffFile => ({
  ...file,
  hunks,
});

/**
 * Produces a bounded diff view by including whole hunks only. The returned
 * evidence index intentionally contains only selected hunks, so omitted hunks
 * cannot later be used to ground a model finding.
 */
export const selectCompleteHunks = (
  diff: string,
  maxCharacters: number,
): CompleteHunkSelection => {
  const parsed = parseUnifiedDiff(diff);
  const limit = Math.max(0, maxCharacters);
  let view = "";
  let includedHunks = 0;
  const selectedFiles: DiffFile[] = [];
  const unreviewedAddedLines = new Map<string, ReadonlySet<number>>();

  for (const file of parsed.files) {
    const selectedHunks: DiffHunk[] = [];
    for (const hunk of file.hunks) {
      if (file.status !== "supported" || !hunk.complete) continue;
      const prefix = selectedHunks.length === 0 ? `${file.header}\n` : "";
      const block = `${prefix}${hunk.rendered}\n`;
      if (view.length + block.length > limit) continue;
      view += block;
      selectedHunks.push(hunk);
      includedHunks += 1;
    }
    selectedFiles.push(withHunks(file, selectedHunks));

    if (file.path) {
      const selectedHunkIds = new Set(selectedHunks.map((hunk) => hunk.id));
      const omittedAnchors = new Set(
        file.hunks
          .filter((hunk) => !selectedHunkIds.has(hunk.id))
          .flatMap((hunk) =>
            hunk.lines
              .filter((line) => line.kind === "added" && line.newLine !== null)
              .map((line) => line.newLine as number),
          ),
      );
      if (omittedAnchors.size > 0)
        unreviewedAddedLines.set(file.path, omittedAnchors);
    }
  }

  const totalHunks = parsed.files.reduce(
    (count, file) => count + file.hunks.length,
    0,
  );
  const includedFiles = selectedFiles
    .filter((file) => file.hunks.length > 0 && file.path)
    .map((file) => file.path as string);
  const omittedFiles = parsed.files
    .filter((file) => file.path && !includedFiles.includes(file.path))
    .map((file) => file.path as string);

  return {
    view,
    index: {
      files: selectedFiles,
      changedPaths: new Set(parsed.changedPaths),
      unreviewedAddedLines,
    },
    coverage: {
      totalHunks,
      includedHunks,
      omittedHunks: totalHunks - includedHunks,
      totalFiles: parsed.files.length,
      includedFiles,
      omittedFiles,
    },
  };
};

const candidateCodeLines = (currentCode: string): string[] =>
  normalizeLineEndings(currentCode).split("\n");

/**
 * Grounds a candidate against a complete-hunk index. It accepts no fuzzy
 * matching: path, changed anchor, range, and source text must all be exact
 * except CRLF/LF normalization of currentCode.
 */
export const groundCandidate = (
  candidate: GroundingCandidate,
  index: DiffEvidenceIndex,
): CandidateGrounding => {
  const path = canonicalRepositoryPath(candidate.filePath);
  if (!path || path !== candidate.filePath)
    return { status: "rejected", reason: "invalid-path" };
  if (!index.changedPaths.has(path))
    return { status: "rejected", reason: "path-not-changed" };

  const file = index.files.find((entry) => entry.path === path);
  if (!file || file.status !== "supported")
    return { status: "rejected", reason: "unsupported-file" };
  if (
    candidate.currentCode === undefined ||
    candidate.currentCode.length === 0
  ) {
    return { status: "rejected", reason: "missing-current-code" };
  }

  const startLine = candidate.startLine ?? candidate.line;
  const codeLines = candidateCodeLines(candidate.currentCode);
  const endLine = startLine + codeLines.length - 1;
  if (
    !Number.isSafeInteger(candidate.line) ||
    !Number.isSafeInteger(startLine) ||
    candidate.line < 1 ||
    startLine < 1 ||
    endLine < startLine ||
    candidate.line < startLine ||
    candidate.line > endLine
  ) {
    return { status: "rejected", reason: "invalid-line-range" };
  }

  const hunk = file.hunks.find((entry) =>
    entry.lines.some(
      (line) => line.kind === "added" && line.newLine === candidate.line,
    ),
  );
  if (!hunk) {
    return index.unreviewedAddedLines.get(path)?.has(candidate.line)
      ? { status: "rejected", reason: "anchor-not-reviewed" }
      : { status: "rejected", reason: "anchor-not-added" };
  }

  const sourceLines = hunk.lines.filter((line) => line.newLine !== null);
  const range = sourceLines.filter(
    (line) =>
      line.newLine !== null &&
      line.newLine >= startLine &&
      line.newLine <= endLine,
  );
  if (
    range.length !== codeLines.length ||
    range[0]?.newLine !== startLine ||
    range.at(-1)?.newLine !== endLine
  ) {
    return { status: "rejected", reason: "code-not-in-hunk" };
  }
  if (range.some((line, lineIndex) => line.content !== codeLines[lineIndex])) {
    return { status: "rejected", reason: "code-mismatch" };
  }

  return { status: "grounded", path, hunkId: hunk.id, startLine, endLine };
};
