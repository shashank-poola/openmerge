import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { env } from "../../config/env.config";
import type { PRHistoryEntry } from "../review.state";

const createInstallationOctokit = (githubInstallationId: string) =>
    new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            installationId: Number(githubInstallationId),
        },
    });

export const fetchPRHistory = async (params: {
    githubInstallationId: string;
    owner: string;
    repoName: string;
    changedFiles: string[];
    currentPrNumber: number;
}): Promise<PRHistoryEntry[]> => {
    const octokit = createInstallationOctokit(params.githubInstallationId);
    const changedFileSet = new Set(params.changedFiles);
    const entries: PRHistoryEntry[] = [];

    // Fetch last 10 merged/closed PRs
    const { data: prs } = await octokit.rest.pulls.list({
        owner: params.owner,
        repo: params.repoName,
        state: "closed",
        per_page: 10,
        sort: "updated",
        direction: "desc",
    });

    await Promise.all(
        prs
            .filter((pr) => pr.number !== params.currentPrNumber)
            .map(async (pr) => {
                try {
                    const { data: comments } = await octokit.rest.pulls.listReviewComments({
                        owner: params.owner,
                        repo: params.repoName,
                        pull_number: pr.number,
                        per_page: 100,
                    });

                    for (const comment of comments) {
                        if (!changedFileSet.has(comment.path)) continue;
                        entries.push({
                            prNumber: pr.number,
                            prTitle: pr.title,
                            filePath: comment.path,
                            line: comment.line ?? comment.original_line ?? null,
                            body: comment.body.slice(0, 500), // cap body length
                            author: comment.user?.login ?? "unknown",
                            createdAt: comment.created_at,
                        });
                    }
                } catch { /* skip failed PRs */ }
            })
    );

    return entries;
};
