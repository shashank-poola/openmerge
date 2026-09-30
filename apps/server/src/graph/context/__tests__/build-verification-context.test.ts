import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { FindingCandidate } from "../../../agent/finding-verifier.types";
import { buildVerificationContext } from "../build-verification-context";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const candidate = (filePath: string): FindingCandidate => ({
  id: "code-1",
  sourceAgent: "code",
  comment: {
    filePath,
    line: 2,
    body: "Confirmed defect.",
    severity: "MEDIUM",
    category: "BUG",
    currentCode: "changed();",
  },
  diffEvidence: "@@ -1,2 +1,2 @@\n context();\n+changed();",
});

describe("buildVerificationContext", () => {
  test("includes a bounded changed hunk and a regular source window", async () => {
    const root = await mkdtemp(join(tmpdir(), "openmerge-context-"));
    roots.push(root);
    await mkdir(join(root, "src"));
    await writeFile(join(root, "src/review.ts"), "context();\nchanged();\n");

    const snippets = await buildVerificationContext([candidate("src/review.ts")], root);

    expect(snippets.find((snippet) => snippet.source === "diff")?.text).toContain(" context();");
    expect(snippets.find((snippet) => snippet.source === "diff")?.text).toContain("+changed();");
    expect(snippets.find((snippet) => snippet.source === "head")?.text).toContain("2: changed();");
  });

  test("does not follow a pull-request symlink into git metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "openmerge-context-"));
    roots.push(root);
    await mkdir(join(root, ".git"));
    await writeFile(join(root, ".git/config"), "token=secret-installation-token\n");
    await symlink(".git/config", join(root, "leak"));

    const snippets = await buildVerificationContext([candidate("leak")], root);

    expect(snippets).toHaveLength(1);
    expect(snippets[0]?.source).toBe("diff");
    expect(JSON.stringify(snippets)).not.toContain("secret-installation-token");
  });

  test("does not follow a symlink outside the clone root", async () => {
    const root = await mkdtemp(join(tmpdir(), "openmerge-context-"));
    const outside = await mkdtemp(join(tmpdir(), "openmerge-outside-"));
    roots.push(root, outside);
    await writeFile(join(outside, "secret"), "outside-secret\n");
    await symlink(join(outside, "secret"), join(root, "leak"));

    const snippets = await buildVerificationContext([candidate("leak")], root);

    expect(snippets).toHaveLength(1);
    expect(JSON.stringify(snippets)).not.toContain("outside-secret");
  });

  test("never reads a direct git metadata path", async () => {
    const root = await mkdtemp(join(tmpdir(), "openmerge-context-"));
    roots.push(root);
    await mkdir(join(root, ".git"));
    await writeFile(join(root, ".git/config"), "token=secret-installation-token\n");

    const snippets = await buildVerificationContext([candidate(".git/config")], root);

    expect(snippets).toHaveLength(1);
    expect(JSON.stringify(snippets)).not.toContain("secret-installation-token");
  });

  test("uses the grounded line index when a hunk repeats the same source text", async () => {
    const repeated = candidate("src/review.ts");
    const hunkLines = ["@@ -1,30 +1,30 @@", "+changed();"];
    for (let index = 2; index < 25; index += 1) hunkLines.push(` context-${index}`);
    hunkLines.push("+changed();", " unique-second-location");
    repeated.diffEvidence = hunkLines.join("\n");
    repeated.diffEvidenceAnchorIndex = 25;

    const snippets = await buildVerificationContext([repeated], null);

    expect(snippets[0]?.text).toContain("unique-second-location");
    expect(snippets[0]?.text).not.toContain("@@ -1,30 +1,30 @@");
  });
});
