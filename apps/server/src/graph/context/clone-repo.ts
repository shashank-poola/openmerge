import { createAppAuth } from "@octokit/auth-app";
import { env } from "../../config/env.config";
import { exec } from "child_process";
import { promisify } from "util";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

export type CloneResult = {
    localPath: string;
    token: string;
};

const getInstallationToken = async (githubInstallationId: string): Promise<string> => {
    const auth = createAppAuth({
        appId: env.GITHUB_APP_ID,
        privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
        installationId: Number(githubInstallationId),
    });
    const { token } = await auth({ type: "installation" });
    return token as string;
};

export const cloneRepo = async (params: {
    githubInstallationId: string;
    owner: string;
    repoName: string;
    headSha: string;
}): Promise<CloneResult> => {
    const token = await getInstallationToken(params.githubInstallationId);
    const localPath = await mkdtemp(join(tmpdir(), "openmerge-"));

    const cloneUrl = `https://x-access-token:${token}@github.com/${params.owner}/${params.repoName}.git`;

    await execAsync(`git clone --depth 1 --no-tags --single-branch "${cloneUrl}" .`, {
        cwd: localPath,
        timeout: 60_000,
    });

    try {
        await execAsync(`git checkout ${params.headSha}`, {
            cwd: localPath,
            timeout: 30_000,
        });
    } catch {
        // Commit not in shallow clone — fetch it directly then checkout
        await execAsync(`git fetch --depth 1 origin ${params.headSha}`, {
            cwd: localPath,
            timeout: 60_000,
        });
        await execAsync(`git checkout ${params.headSha}`, {
            cwd: localPath,
            timeout: 30_000,
        });
    }

    return { localPath, token };
};

export const cleanupRepo = async (localPath: string): Promise<void> => {
    try {
        await rm(localPath, { recursive: true, force: true });
    } catch { /* */ }
};
