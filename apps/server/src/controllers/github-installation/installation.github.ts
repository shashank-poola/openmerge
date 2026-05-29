import type { Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { db } from '@repo/database';
import { env } from '../../config/env';
import { installationSchema } from '../../schema/installation.schema';
import { repoSchema } from '../../schema/repo.schema';
import { githubInstallation } from '../../types/installation.type';
import { githubRepo } from '../../types/repo.type';
import jwt from 'jsonwebtoken';

type GithubInstallationData = {
    id: number;
    account: { id: number; login: string; type: string };
};

type GithubRepoData = {
    id: number;
    owner: { login: string };
    name: string;
    full_name: string;
    default_branch: string;
    private: boolean;
};

const generateAppJwt = () => {
    const privateKey = env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
        { iat: now - 60, exp: now + 600, iss: Number(env.GITHUB_APP_ID) },
        privateKey,
        { algorithm: 'RS256' }
    );
};

const getInstallationToken = async (githubInstallationId: string | bigint): Promise<string> => {
    const appJwt = generateAppJwt();
    const res = await fetch(`https://api.github.com/app/installations/${githubInstallationId}/access_tokens`, {
        method: 'POST',
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${appJwt}`,
            'User-Agent': 'pullrabbit-server',
        },
    });
    if (!res.ok) throw new Error(`Failed to get installation token: ${res.status}`);
    const data = await res.json() as { token: string };
    return data.token;
};

const fetchInstallationRepos = async (installationToken: string): Promise<GithubRepoData[]> => {
    const repos: GithubRepoData[] = [];
    let page = 1;

    while (true) {
        const res = await fetch(`https://api.github.com/installation/repositories?per_page=100&page=${page}`, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${installationToken}`,
                'User-Agent': 'pullrabbit-server',
            },
        });
        if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);

        const data = await res.json() as { repositories: GithubRepoData[]; total_count: number };
        repos.push(...data.repositories);

        if (repos.length >= data.total_count) break;
        page++;
    }

    return repos;
};

const upsertRepos = async (installationId: string, rawRepos: GithubRepoData[]) => {
    return Promise.all(
        rawRepos.map(async (repo) => {
            const parsed = repoSchema.parse({
                installationId,
                githubRepoId: repo.id,
                owner: repo.owner.login,
                name: repo.name,
                fullName: repo.full_name,
                defaultBranch: repo.default_branch,
                isPrivate: repo.private,
                isActive: true,
                autoReviewEnabled: true,
            });

            return db.repository.upsert({
                where: { githubRepoId: parsed.githubRepoId },
                update: {
                    installationId,
                    owner: parsed.owner,
                    name: parsed.name,
                    fullName: parsed.fullName,
                    defaultBranch: parsed.defaultBranch,
                    isPrivate: parsed.isPrivate,
                    isActive: true,
                },
                create: {
                    installationId: parsed.installationId,
                    githubRepoId: parsed.githubRepoId,
                    owner: parsed.owner,
                    name: parsed.name,
                    fullName: parsed.fullName,
                    defaultBranch: parsed.defaultBranch,
                    isPrivate: parsed.isPrivate,
                    isActive: parsed.isActive,
                    autoReviewEnabled: parsed.autoReviewEnabled,
                },
            });
        })
    );
};

export const handleInstallationCallback = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
        }

        const { installationId } = req.body;
        if (!installationId) {
            return res.status(400).json({ success: false, message: null, error: 'MISSING_INSTALLATION_ID' });
        }

        const appJwt = generateAppJwt();
        const installationRes = await fetch(`https://api.github.com/app/installations/${installationId}`, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${appJwt}`,
                'User-Agent': 'pullrabbit-server',
            },
        });

        if (!installationRes.ok) {
            console.error('Failed to fetch installation from GitHub:', installationRes.status);
            return res.status(502).json({ success: false, message: null, error: 'FAILED_FETCHING_INSTALLATION' });
        }

        const installationData = await installationRes.json() as GithubInstallationData;

        const installationToken = await getInstallationToken(installationId);
        const rawRepos = await fetchInstallationRepos(installationToken);

        const parsed = installationSchema.parse({
            userId,
            githubInstallationId: installationData.id,
            githubAccountId: installationData.account.id,
            githubAccountLogin: installationData.account.login,
            githubAccountType: installationData.account.type,
            isPersonalAccount: installationData.account.type === 'User',
            status: 'ACTIVE',
        });

        const installation = await db.installation.upsert({
            where: { githubInstallationId: parsed.githubInstallationId },
            update: {
                userId,
                status: 'ACTIVE',
                githubAccountLogin: parsed.githubAccountLogin,
                githubAccountType: parsed.githubAccountType,
            },
            create: {
                userId: parsed.userId,
                githubInstallationId: parsed.githubInstallationId,
                githubAccountId: parsed.githubAccountId,
                githubAccountLogin: parsed.githubAccountLogin,
                githubAccountType: parsed.githubAccountType,
                isPersonalAccount: parsed.isPersonalAccount,
                status: 'ACTIVE',
            },
        });

        const repos = await upsertRepos(installation.id, rawRepos);

        return res.status(201).json({
            success: true,
            installation: githubInstallation(installation),
            repos: repos.map(githubRepo),
            error: null,
        });

    } catch (err) {
        console.error('handleInstallationCallback failed:', err);
        return res.status(500).json({ success: false, message: null, error: 'INSTALLATION_FAILED' });
    }
};

export const syncInstallationRepos = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const installationId = typeof req.params.installationId === 'string' ? req.params.installationId : null;

        if (!userId) {
            return res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
        }

        if (!installationId) {
            return res.status(400).json({ success: false, message: null, error: 'INVALID_PARAMS' });
        }

        const installation = await db.installation.findFirst({
            where: { id: installationId, userId },
        });

        if (!installation) {
            return res.status(404).json({ success: false, message: null, error: 'INSTALLATION_NOT_FOUND' });
        }

        const installationToken = await getInstallationToken(installation.githubInstallationId);
        const rawRepos = await fetchInstallationRepos(installationToken);

        const incomingIds = rawRepos.map((r) => BigInt(r.id));
        await db.repository.updateMany({
            where: {
                installationId: installation.id,
                githubRepoId: { notIn: incomingIds },
            },
            data: { isActive: false },
        });

        const repos = await upsertRepos(installation.id, rawRepos);

        return res.status(200).json({
            success: true,
            repos: repos.map(githubRepo),
            error: null,
        });

    } catch (err) {
        console.error('syncInstallationRepos failed:', err);
        return res.status(500).json({ success: false, message: null, error: 'SYNC_REPOS_FAILED' });
    }
};
