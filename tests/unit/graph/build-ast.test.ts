import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { buildAST } from "../../../apps/server/src/graph/context/build-ast";

const tempRoots: string[] = [];

async function createRepoFixture() {
  const root = await mkdtemp(join(tmpdir(), "pullrabbit-ast-"));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("buildAST", () => {
  test("extracts TypeScript functions, classes, methods, and local imports", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "src"), { recursive: true });
    await writeFile(join(repo, "src", "review.ts"), [
      "import PullRabbit, { scoreReview as score } from './score';",
      "import 'reflect-metadata';",
      "export async function analyze() { return score(); }",
      "const helper = () => analyze();",
      "export class Reviewer {",
      "  async run() { return helper(); }",
      "}",
    ].join("\n"));

    const [summary] = await buildAST({ changedFiles: ["src/review.ts"], repoLocalPath: repo });

    expect(summary?.language).toBe("typescript");
    expect(summary?.functions).toContainEqual({ name: "analyze", startLine: 3, isExported: true, isAsync: true });
    expect(summary?.functions).toContainEqual({ name: "helper", startLine: 4, isExported: false, isAsync: false });
    expect(summary?.classes[0]).toMatchObject({ name: "Reviewer", isExported: true, methods: ["run"] });
    expect(summary?.imports).toContainEqual({ source: "./score", specifiers: ["PullRabbit", "scoreReview as score"], isLocal: true });
    expect(summary?.imports).toContainEqual({ source: "reflect-metadata", specifiers: [], isLocal: false });
  });

  test("ignores unsupported or missing files instead of failing the whole review", async () => {
    const repo = await createRepoFixture();

    const results = await buildAST({
      changedFiles: ["README.md", "src/missing.ts"],
      repoLocalPath: repo,
    });

    expect(results).toEqual([]);
  });

  test("extracts Python and Rust symbols for multi-language repos", async () => {
    const repo = await createRepoFixture();
    await mkdir(join(repo, "pkg"), { recursive: true });
    await writeFile(join(repo, "pkg", "worker.py"), [
      "from .tasks import run_task as run",
      "async def process(): pass",
      "class Runner:",
      "    def execute(self): pass",
    ].join("\n"));
    await writeFile(join(repo, "pkg", "lib.rs"), [
      "use crate::review::{Finding, Severity};",
      "pub async fn analyze() {}",
      "pub struct Reviewer {}",
      "impl Reviewer { pub fn run(&self) {} }",
    ].join("\n"));

    const results = await buildAST({ changedFiles: ["pkg/worker.py", "pkg/lib.rs"], repoLocalPath: repo });

    const python = results.find((result) => result.filePath === "pkg/worker.py");
    const rust = results.find((result) => result.filePath === "pkg/lib.rs");

    expect(python?.language).toBe("python");
    expect(python?.functions).toContainEqual({ name: "process", startLine: 2, isExported: true, isAsync: true });
    expect(python?.classes[0]).toMatchObject({ name: "Runner", methods: ["execute"] });
    expect(rust?.language).toBe("rust");
    expect(rust?.functions).toContainEqual({ name: "analyze", startLine: 2, isExported: true, isAsync: true });
    expect(rust?.imports[0]).toMatchObject({ source: "crate::review", specifiers: ["Finding", "Severity"], isLocal: true });
  });
});
