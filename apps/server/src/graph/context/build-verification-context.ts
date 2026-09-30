import { lstat, readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { EvidenceSnippet, FindingCandidate } from "../../agent/finding-verifier.types";

const MAX_FILE_BYTES = 256_000;
const MAX_SNIPPET_CHARS = 3_000;
const MAX_TOTAL_CHARS = 64_000;
const WINDOW_LINES = 12;

const boundedDiffEvidence = (candidate: FindingCandidate): string => {
  const fallback = candidate.comment.currentCode ?? "";
  if (!candidate.diffEvidence) return fallback;
  const lines = candidate.diffEvidence.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const anchor = `+${fallback.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")[0] ?? ""}`;
  const anchorIndex = lines.indexOf(anchor);
  if (anchorIndex < 0) return fallback;
  const start = Math.max(0, anchorIndex - WINDOW_LINES);
  const end = Math.min(lines.length, anchorIndex + WINDOW_LINES + 1);
  return lines.slice(start, end).join("\n").slice(0, MAX_SNIPPET_CHARS);
};

const isWithin = (root: string, candidate: string): boolean => {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot !== ".." && !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
};

const sourceWindow = async (
  root: string,
  candidate: FindingCandidate,
): Promise<EvidenceSnippet | null> => {
  if (isAbsolute(candidate.comment.filePath) || candidate.comment.filePath.includes("\0")) return null;

  const resolvedRoot = await realpath(root);
  const requested = resolve(resolvedRoot, candidate.comment.filePath);
  if (!isWithin(resolvedRoot, requested)) return null;

  if (candidate.comment.filePath.split("/").includes(".git")) return null;
  const requestedStats = await lstat(requested);
  if (requestedStats.isSymbolicLink() || !requestedStats.isFile() || requestedStats.size > MAX_FILE_BYTES) return null;

  const resolvedFile = await realpath(requested);
  if (!isWithin(resolvedRoot, resolvedFile) || resolvedFile !== requested) return null;

  const buffer = await readFile(resolvedFile);
  if (buffer.includes(0)) return null;
  const lines = buffer.toString("utf8").replace(/\r\n/g, "\n").split("\n");
  const startLine = Math.max(1, candidate.comment.line - WINDOW_LINES);
  const endLine = Math.min(lines.length, candidate.comment.line + WINDOW_LINES);
  const text = lines
    .slice(startLine - 1, endLine)
    .map((line, index) => `${startLine + index}: ${line}`)
    .join("\n")
    .slice(0, MAX_SNIPPET_CHARS);

  return {
    id: `${candidate.id}:head`,
    filePath: candidate.comment.filePath,
    startLine,
    endLine,
    source: "head",
    text,
  };
};

export const buildVerificationContext = async (
  candidates: FindingCandidate[],
  repoLocalPath: string | null,
): Promise<EvidenceSnippet[]> => {
  const snippets: EvidenceSnippet[] = [];
  let totalChars = 0;

  for (const candidate of candidates) {
    const currentCode = candidate.comment.currentCode?.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!currentCode) continue;
    const diffSnippet: EvidenceSnippet = {
      id: `${candidate.id}:diff`,
      filePath: candidate.comment.filePath,
      startLine: candidate.comment.startLine ?? candidate.comment.line,
      endLine: candidate.comment.line,
      source: "diff",
      text: boundedDiffEvidence(candidate),
    };
    snippets.push(diffSnippet);
    totalChars += diffSnippet.text.length;

    if (!repoLocalPath || totalChars >= MAX_TOTAL_CHARS) continue;
    try {
      const headSnippet = await sourceWindow(repoLocalPath, candidate);
      if (!headSnippet || totalChars + headSnippet.text.length > MAX_TOTAL_CHARS) continue;
      snippets.push(headSnippet);
      totalChars += headSnippet.text.length;
    } catch {
      // Diff evidence is sufficient for self-contained findings. Missing source remains unknown.
    }
  }

  return snippets;
};
