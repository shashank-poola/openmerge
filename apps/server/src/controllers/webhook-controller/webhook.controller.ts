import type { Request, Response } from 'express';
import { Webhooks } from '@octokit/webhooks';
import { db } from '@repo/database';
import { env } from '../../config/env.config';
import { reviewGraph } from '../../graph/review.graph';

const webhooks = new Webhooks({ secret: env.GITHUB_WEBHOOK_SECRET });

type PullRequestPayload = {
    action: string;
    number: number;
    pull_request: {
        head: { sha: string };
        base: { ref: string };
    };
    repository: { id: number };
    installation?: { id: number };
};

type InstallationPayload = {
    action: string;
    installation: { id: number };
};

export const handleWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const rawBody = (req as any).rawBody as Buffer | undefined;

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

async function handleInstallationEvent(payload: InstallationPayload) {
    const githubInstallationId = BigInt(payload.installation.id);

    const statusMap: Record<string, 'ACTIVE' | 'SUSPENDED' | 'REMOVED'> = {
        deleted: 'REMOVED',
        suspend: 'SUSPENDED',
        unsuspend: 'ACTIVE',
    };

    const status = statusMap[payload.action];
    if (!status) return;

    await db.installation.updateMany({
        where: { githubInstallationId },
        data: { status },
    });
}

async function handlePullRequestEvent(payload: PullRequestPayload) {
    const triggerActions = ['opened', 'synchronize', 'reopened'];
    if (!triggerActions.includes(payload.action)) return;

    const githubRepoId = BigInt(payload.repository.id);

    const repo = await db.repository.findUnique({
        where: { githubRepoId },
        include: { installation: { select: { status: true, githubInstallationId: true } } },
    });

    if (!repo || !repo.isActive || !repo.autoReviewEnabled) return;
    if (repo.installation.status !== 'ACTIVE') return;

    const prNumber = payload.number;
    const headSha = payload.pull_request.head.sha;
    const baseBranch = payload.pull_request.base.ref;

    const existing = await db.reviewSession.findFirst({
        where: { repositoryId: repo.id, prNumber, status: { in: ['QUEUED', 'RUNNING'] } },
    });

    let session;
    if (existing) {
        session = await db.reviewSession.update({
            where: { id: existing.id },
            data: { headSha, status: 'QUEUED' },
        });
    } else {
        session = await db.reviewSession.create({
            data: { repositoryId: repo.id, prNumber, headSha, baseBranch, status: 'QUEUED' },
        });
    }

    reviewGraph.invoke({
        reviewSessionId: session.id,
        repositoryId: repo.id,
        githubInstallationId: repo.installation.githubInstallationId.toString(),
        prNumber,
        headSha,
        baseBranch,
        owner: repo.owner,
        repoName: repo.name,
    }).catch((err) => {
        console.error(`Graph failed for session ${session.id}:`, err);
    });
}
