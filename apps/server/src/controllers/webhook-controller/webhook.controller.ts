import type { Request, Response } from 'express';
import { Webhooks } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { db } from '@repo/database';
import { env } from '../../config/env.config';
import { reviewQueue } from '../../queue/review.queue';

const webhooks = new Webhooks({ secret: env.GITHUB_WEBHOOK_SECRET });

export type PullRequestPayload = {
    action: string;
    number: number;
    pull_request: {
        head: { sha: string };
        base: { ref: string };
    };
    repository: { id: number };
    installation?: { id: number };
};

export type InstallationPayload = {
    action: string;
    installation: { id: number };
};

export const createInstallationOctokit = (installationId: number) =>
    new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
            installationId,
        },
    });

export const handleWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

    if (!rawBody || typeof signature !== 'string' || typeof event !== 'string') {
        return res.status(400).json({ success: false, error: 'INVALID_WEBHOOK' });
    }

    const isValid = await webhooks.verify(rawBody.toString(), signature);
    if (!isValid) {
        return res.status(401).json({ success: false, error: 'INVALID_SIGNATURE' });
    }

    const payload = req.body;

    try {
        if (event === 'installation') {
            await handleInstallationEvent(payload as InstallationPayload);
        } else if (event === 'pull_request') {
            await handlePullRequestEvent(payload as PullRequestPayload);
        }
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Webhook processing failed:', err);
        return res.status(500).json({ success: false, error: 'WEBHOOK_PROCESSING_FAILED' });
    }
};

type InstallationModel = {
    updateMany: (args: {
        where: { githubInstallationId: bigint };
        data: { status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED' };
    }) => Promise<unknown>;
};

type WebhookDb = Pick<typeof db, "installation" | "repository" | "reviewSession">;

type PullRequestDeps = {
    db: WebhookDb;
    reviewQueue: Pick<typeof reviewQueue, "add">;
    createInstallationOctokit: typeof createInstallationOctokit;
};

export async function handleInstallationEvent(
    payload: InstallationPayload,
    installationModel: InstallationModel = db.installation,
) {
    const githubInstallationId = BigInt(payload.installation.id);
    const statusMap: Record<string, 'ACTIVE' | 'SUSPENDED' | 'REMOVED'> = {
        deleted: 'REMOVED',
        suspend: 'SUSPENDED',
        unsuspend: 'ACTIVE',
    };
    const status = statusMap[payload.action];
    if (!status) return;
    await installationModel.updateMany({ where: { githubInstallationId }, data: { status } });
}

export async function handlePullRequestEvent(
    payload: PullRequestPayload,
    deps: PullRequestDeps = { db, reviewQueue, createInstallationOctokit },
) {
    const triggerActions = ['opened', 'synchronize', 'reopened'];
    if (!triggerActions.includes(payload.action)) return;

    const githubRepoId = BigInt(payload.repository.id);

    const repo = await deps.db.repository.findUnique({
        where: { githubRepoId },
        include: { installation: { select: { status: true, githubInstallationId: true } } },
    });

    if (!repo || !repo.isActive || !repo.autoReviewEnabled) return;
    if (repo.installation.status !== 'ACTIVE') return;

    const installationId = Number(repo.installation.githubInstallationId);
    const prNumber = payload.number;
    const headSha = payload.pull_request.head.sha;
    const baseBranch = payload.pull_request.base.ref;

    const existing = await deps.db.reviewSession.findFirst({
        where: { repositoryId: repo.id, prNumber, status: { in: ['QUEUED', 'RUNNING'] } },
    });

    let session;
    if (existing) {
        session = await deps.db.reviewSession.update({
            where: { id: existing.id },
            data: { headSha, status: 'QUEUED' },
        });
    } else {
        session = await deps.db.reviewSession.create({
            data: { repositoryId: repo.id, prNumber, headSha, baseBranch, status: 'QUEUED' },
        });
    }

    let loadingCommentId: bigint | null = null;
    try {
        const octokit = deps.createInstallationOctokit(installationId);
        const { data: comment } = await octokit.rest.issues.createComment({
            owner: repo.owner,
            repo: repo.name,
            issue_number: prNumber,
            body: '**PullRabbit** is analyzing this pull request. An automated review will be posted as inline comments once the analysis is complete.',
        });
        loadingCommentId = BigInt(comment.id);
        await deps.db.reviewSession.update({
            where: { id: session.id },
            data: { githubLoadingCommentId: loadingCommentId },
        });
    } catch { /* */ }

    await deps.reviewQueue.add('review', {
        reviewSessionId: session.id,
        repositoryId: repo.id,
        githubInstallationId: repo.installation.githubInstallationId.toString(),
        prNumber,
        headSha,
        baseBranch,
        owner: repo.owner,
        repoName: repo.name,
    });
}
