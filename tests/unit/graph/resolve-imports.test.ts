import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { resolveImports } from "../../../apps/server/src/graph/context/resolve-imports";

const tempRoots: string[] = [];

async function createRepoFixture() {
  const root = await mkdtemp(join(tmpdir(), "pullrabbit-imports-"));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("resolveImports", () => {
  test("resolves local TypeScript imports and skips changed imported files", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "src"), { recursive: true });
    await writeFile(join(repo, "src", "main.ts"), [
      "import { helper } from './helper';",
      "import { changed } from './changed';",
      "import { z } from 'zod';",
      "helper(); changed(); z.string();",
    ].join("\n"));
    await writeFile(join(repo, "src", "helper.ts"), "export const helper = () => 'ok';");
    await writeFile(join(repo, "src", "changed.ts"), "export const changed = () => 'skip';");

    const imports = await resolveImports({
      changedFiles: ["src/main.ts", "src/changed.ts"],
      repoLocalPath: repo,
    });

    expect(imports).toHaveLength(1);
    expect(imports[0]).toMatchObject({
      importPath: "./helper",
      resolvedPath: "src/helper.ts",
      usedInFile: "src/main.ts",
    });
    expect(imports[0]?.sourceCode).toContain("helper");
  });

  test("deduplicates repeated imports from the same file", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "src"), { recursive: true });
    await writeFile(join(repo, "src", "main.ts"), [
      "import { helper } from './helper';",
      "import { helper as helperAgain } from './helper';",
    ].join("\n"));
    await writeFile(join(repo, "src", "helper.ts"), "export const helper = () => 'ok';");

    const imports = await resolveImports({ changedFiles: ["src/main.ts"], repoLocalPath: repo });

    expect(imports).toHaveLength(1);
  });

  test("canonicalizes changed-file paths before exact matching", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "src"), { recursive: true });
    await writeFile(join(repo, "src", "main.ts"), [
      "import { helper } from './helper';",
      "import { nested } from './nested/value';",
    ].join("\n"));
    await mkdir(join(repo, "src", "nested"), { recursive: true });
    await writeFile(join(repo, "src", "helper.ts"), "export const helper = () => 'skip';");
    await writeFile(join(repo, "src", "nested", "value.ts"), "export const nested = () => 'skip';");

    const imports = await resolveImports({
      changedFiles: ["src/main.ts", "./src/helper.ts", "src/nested/../nested/value.ts"],
      repoLocalPath: repo,
    });

    expect(imports).toHaveLength(0);
  });

  test("resolves Python relative imports without leaking external imports", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "pkg"), { recursive: true });
    await writeFile(join(repo, "pkg", "main.py"), [
      "from .helper import run",
      "import requests",
    ].join("\n"));
    await writeFile(join(repo, "pkg", "helper.py"), "def run(): return 'ok'");

    const imports = await resolveImports({ changedFiles: ["pkg/main.py"], repoLocalPath: repo });

    expect(imports).toHaveLength(1);
    expect(imports[0]).toMatchObject({
      importPath: ".helper",
      resolvedPath: "pkg/helper.py",
      usedInFile: "pkg/main.py",
    });
    expect(imports[0]?.sourceCode).toContain("def run");
  });

  test("truncates very large imported source files", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "src"), { recursive: true });
    await writeFile(join(repo, "src", "main.ts"), "import { huge } from './huge';");
    await writeFile(join(repo, "src", "huge.ts"), `export const huge = '${"x".repeat(10_000)}';`);

    const [importSource] = await resolveImports({ changedFiles: ["src/main.ts"], repoLocalPath: repo });

    expect(importSource?.sourceCode.length).toBe(4_000);
  });
});
