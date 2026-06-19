import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { env } from "../../config/env.config";
import type { PRReviewStateType } from "../review.state";
import { cloneRepo } from "../context/clone-repo";
import { buildAST } from "../context/build-ast";
import { buildCodeGraph } from "../context/build-code-graph";
import { runLinters } from "../context/run-linters";
import { fetchPRHistory } from "../context/fetch-pr-history";
import { resolveImports } from "../context/resolve-imports";

const createInstallationOctokit = (githubInstallationId: string) =>
    new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            installationId: Number(githubInstallationId),
        },
    });

export const fetchContext = async (
    state: PRReviewStateType
): Promise<Partial<PRReviewStateType>> => {
    try {
        const octokit = createInstallationOctokit(state.githubInstallationId);

        const [prRes, diffRes, filesRes] = await Promise.all([
            octokit.rest.pulls.get({
                owner: state.owner,
                repo: state.repoName,
                pull_number: state.prNumber,
            }),
            octokit.rest.pulls.get({
                owner: state.owner,
                repo: state.repoName,
                pull_number: state.prNumber,
                mediaType: { format: "diff" },
            }),
            octokit.rest.pulls.listFiles({
                owner: state.owner,
                repo: state.repoName,
                pull_number: state.prNumber,
                per_page: 100,
            }),
        ]);

        const changedFiles = filesRes.data.map((f) => f.filename);
        const diff = (diffRes.data as unknown as string) ?? null;
        const prTitle = prRes.data.title ?? null;

        let repoLocalPath: string | null = null;
        try {
            const cloneResult = await cloneRepo({
                githubInstallationId: state.githubInstallationId,
                owner: state.owner,
                repoName: state.repoName,
                headSha: state.headSha,
            });
            repoLocalPath = cloneResult.localPath;
        } catch (cloneErr) {
            console.error("fetchContext: clone failed, continuing without local analysis:", cloneErr);
        }

        const [
            astSummariesResult,
            codeGraphResult,
            linterResultsResult,
            prHistoryResult,
            importSourcesResult,
        ] = await Promise.allSettled([
            repoLocalPath
                ? buildAST({ changedFiles, repoLocalPath })
                : Promise.resolve([]),
            repoLocalPath
                ? buildCodeGraph({ changedFiles, repoLocalPath })
                : Promise.resolve([]),
            repoLocalPath
                ? runLinters({ changedFiles, repoLocalPath })
                : Promise.resolve([]),
            fetchPRHistory({
                githubInstallationId: state.githubInstallationId,
                owner: state.owner,
                repoName: state.repoName,
                changedFiles,
                currentPrNumber: state.prNumber,
            }),
            repoLocalPath
                ? resolveImports({ changedFiles, repoLocalPath })
                : Promise.resolve([]),
        ]);

        const settled = <T>(result: PromiseSettledResult<T>, fallback: T): T => {
            if (result.status === "fulfilled") return result.value;
            console.error("fetchContext: context helper failed:", result.reason);
            return fallback;
        };

        return {
            diff,
            changedFiles,
            prTitle,
            repoLocalPath,
            astSummaries:   settled(astSummariesResult,   []),
            codeGraph:      settled(codeGraphResult,      []),
            linterResults:  settled(linterResultsResult,  []),
            prHistory:      settled(prHistoryResult,      []),
            importSources:  settled(importSourcesResult,  []),
        };
    } catch (err) {
        console.error("fetchContext failed:", err);
        return { error: `Failed to fetch PR context: ${err}` };
    }
};
