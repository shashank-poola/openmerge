import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { env } from "../../config/env.config";
import type { PRReviewStateType } from "../review.state";

const createInstallationOctokit = (githubInstallationId: string) => {
    return new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            installationId: Number(githubInstallationId),
        },
    });
};

export const fetchContext = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
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

        return { diff, changedFiles, prTitle };
    } catch (err) {
        console.error("fetchContext failed:", err);
        return { error: `Failed to fetch PR context: ${err}` };
    }
};
