import { describe, expect, test } from "bun:test";
import {
  canonicalChangedPath,
  groundCandidate,
  parseUnifiedDiff,
  selectCompleteHunks,
} from "../diff-grounding";

const twoHunkDiff = `diff --git a/src/example.ts b/src/example.ts
index 1111111..2222222 100644
--- a/src/example.ts
+++ b/src/example.ts
@@ -1,2 +1,3 @@
 keep
-oldValue
+newValue
+addedFirst
@@ -10 +11,3 @@ export const run = () => {
 context
+addedSecond
+return true;
`;

describe("unified diff grounding", () => {
  test("parses canonical paths, omitted hunk counts, and added anchors", () => {
    const parsed = parseUnifiedDiff(twoHunkDiff);
    const file = parsed.files[0];

    expect(canonicalChangedPath("b/src/example.ts")).toBe("src/example.ts");
    expect(file).toMatchObject({ path: "src/example.ts", status: "supported" });
    expect(file?.hunks).toHaveLength(2);
    expect(file?.hunks[1]).toMatchObject({ oldCount: 1, newCount: 3 });
    expect(file?.hunks[1]?.lines[1]).toMatchObject({
      kind: "added",
      newLine: 12,
      content: "addedSecond",
    });
  });

  test("grounds only exact current code at an added line", () => {
    const index = selectCompleteHunks(twoHunkDiff, 10_000).index;

    expect(
      groundCandidate(
        {
          filePath: "src/example.ts",
          line: 12,
          startLine: 12,
          currentCode: "addedSecond\nreturn true;",
        },
        index,
      ),
    ).toMatchObject({
      status: "grounded",
      startLine: 12,
      endLine: 13,
    });
    expect(
      groundCandidate(
        { filePath: "src/example.ts", line: 11, currentCode: "context" },
        index,
      ),
    ).toEqual({
      status: "rejected",
      reason: "anchor-not-added",
    });
    expect(
      groundCandidate(
        { filePath: "src/example.ts", line: 12, currentCode: "addedSecond " },
        index,
      ),
    ).toEqual({
      status: "rejected",
      reason: "code-mismatch",
    });
  });

  test("normalizes only CRLF line endings in current code", () => {
    const index = selectCompleteHunks(
      twoHunkDiff.replace(/\n/g, "\r\n"),
      10_000,
    ).index;

    expect(
      groundCandidate(
        {
          filePath: "src/example.ts",
          line: 12,
          currentCode: "addedSecond\r\nreturn true;",
        },
        index,
      ).status,
    ).toBe("grounded");
    expect(
      groundCandidate(
        {
          filePath: "src/example.ts",
          line: 12,
          currentCode: "addedSecond\nreturn true;\n",
        },
        index,
      ),
    ).toEqual({
      status: "rejected",
      reason: "code-not-in-hunk",
    });
  });

  test("uses a renamed file's canonical new path", () => {
    const diff = `diff --git a/a/old-name.ts b/a/new-name.ts
similarity index 80%
rename from a/old-name.ts
rename to a/new-name.ts
--- a/a/old-name.ts
+++ b/a/new-name.ts
@@ -1 +1 @@
-before
+after
`;
    const index = selectCompleteHunks(diff, 10_000).index;

    expect(index.files[0]).toMatchObject({
      path: "a/new-name.ts",
      previousPath: "a/old-name.ts",
    });
    expect(
      groundCandidate(
        { filePath: "a/new-name.ts", line: 1, currentCode: "after" },
        index,
      ).status,
    ).toBe("grounded");
    expect(
      groundCandidate(
        { filePath: "a/old-name.ts", line: 1, currentCode: "after" },
        index,
      ),
    ).toEqual({
      status: "rejected",
      reason: "path-not-changed",
    });
  });

  test("does not treat no-newline markers as source lines", () => {
    const diff = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-before
\\ No newline at end of file
+after
\\ No newline at end of file
`;
    const index = selectCompleteHunks(diff, 10_000).index;

    expect(index.files[0]?.hunks[0]).toMatchObject({ complete: true });
    expect(
      groundCandidate(
        { filePath: "file.txt", line: 1, currentCode: "after" },
        index,
      ).status,
    ).toBe("grounded");
  });

  test("keeps deleted-file hunks in the specialist view without limiting coverage", () => {
    const diff = `diff --git a/src/obsolete.ts b/src/obsolete.ts
deleted file mode 100644
--- a/src/obsolete.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-export const obsolete = true;
--- removed SQL-style comment
`;

    const selection = selectCompleteHunks(diff, 10_000);

    expect(selection.index.files[0]).toMatchObject({
      path: null,
      previousPath: "src/obsolete.ts",
      status: "supported",
    });
    expect(selection.index.files[0]?.hunks[0]).toMatchObject({ complete: true });
    expect(selection.view).toContain("--- removed SQL-style comment");
    expect(selection.coverage).toMatchObject({ totalHunks: 1, includedHunks: 1, omittedHunks: 0 });
  });

  test("does not parse added or removed source prefixes as file markers", () => {
    const diff = `diff --git a/query.sql b/query.sql
--- a/query.sql
+++ b/query.sql
@@ -1,2 +1,2 @@
--- old comment
+++ new comment
 SELECT 1;
`;

    const parsed = parseUnifiedDiff(diff);

    expect(parsed.files[0]).toMatchObject({ path: "query.sql", status: "supported" });
    expect(parsed.files[0]?.hunks[0]).toMatchObject({ complete: true });
  });

  test("records omitted coverage and never accepts a partial hunk", () => {
    const complete = selectCompleteHunks(twoHunkDiff, 10_000);
    const firstHunkOnly = selectCompleteHunks(
      twoHunkDiff,
      complete.view.indexOf("@@ -10"),
    );

    expect(firstHunkOnly.coverage).toMatchObject({
      totalHunks: 2,
      includedHunks: 1,
      omittedHunks: 1,
    });
    expect(firstHunkOnly.view).toContain("addedFirst");
    expect(firstHunkOnly.view).not.toContain("addedSecond");
    expect(
      groundCandidate(
        { filePath: "src/example.ts", line: 12, currentCode: "addedSecond" },
        firstHunkOnly.index,
      ),
    ).toEqual({
      status: "rejected",
      reason: "anchor-not-reviewed",
    });
  });

  test("rejects binary and unsupported file sections", () => {
    const binary = `diff --git a/logo.png b/logo.png
Binary files a/logo.png and b/logo.png differ
`;
    const combined = `diff --cc src/conflict.ts
index 1111111,2222222..3333333
@@@ -1,1 -1,1 +1,1 @@@
+merged
`;

    const binaryIndex = selectCompleteHunks(binary, 10_000).index;
    const combinedIndex = selectCompleteHunks(combined, 10_000).index;
    expect(binaryIndex.files[0]).toMatchObject({ status: "binary" });
    expect(
      groundCandidate(
        { filePath: "logo.png", line: 1, currentCode: "data" },
        binaryIndex,
      ),
    ).toEqual({
      status: "rejected",
      reason: "unsupported-file",
    });
    expect(combinedIndex.files[0]).toMatchObject({ status: "unsupported" });
    expect(
      groundCandidate(
        { filePath: "src/conflict.ts", line: 1, currentCode: "merged" },
        combinedIndex,
      ),
    ).toEqual({
      status: "rejected",
      reason: "unsupported-file",
    });
  });
});
