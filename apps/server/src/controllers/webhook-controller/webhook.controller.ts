import type { Request, Response } from 'express';
import { Webhooks } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { db } from '@repo/database';
import { env } from '../../config/env.config';
import { buildReviewJobId, reviewQueue, type ReviewJobData } from '../../queue/review.queue';

const webhooks = new Webhooks({ secret: env.GITHUB_WEBHOOK_SECRET });
const WEBHOOK_RECEIVED_STALE_MS = 5 * 60 * 1000;

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

type RawWebhookRequest = Request & { rawBody?: Buffer };
type InstallationModel = {
    updateMany: (args: {
        where: { githubInstallationId: bigint };
        data: { status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED' };
    }) => Promise<unknown>;
};
type WebhookDb = Pick<typeof db, 'installation' | 'repository' | 'reviewSession'>;

type PullRequestDeps = {
    db: WebhookDb;
    reviewQueue: Pick<typeof reviewQueue, 'add'>;
    createInstallationOctokit: typeof createInstallationOctokit;
};

export type WebhookHandlerDeps = {
    verify: (payload: string, signature: string) => Promise<boolean>;
    recordDelivery: (deliveryId: string, eventName: string) => Promise<boolean>;
    updateDelivery: (deliveryId: string, status: 'PROCESSED' | 'IGNORED' | 'FAILED', errorMessage?: string) => Promise<void>;
    handleInstallationEvent: typeof handleInstallationEvent;
    handlePullRequestEvent: typeof handlePullRequestEvent;
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

async function recordWebhookDelivery(deliveryId: string, eventName: string): Promise<boolean> {
    const existing = await db.webhookDelivery.findUnique({ where: { deliveryId } });
    const staleBefore = new Date(Date.now() - WEBHOOK_RECEIVED_STALE_MS);

    if (existing?.status === 'FAILED') {
        const reclaimed = await db.webhookDelivery.updateMany({
            where: { deliveryId, status: 'FAILED' },
            data: { status: 'RECEIVED', errorMessage: null, processedAt: null },
        });
        return reclaimed.count > 0;
    }

    if (existing?.status === 'RECEIVED' && existing.receivedAt < staleBefore) {
        const reclaimed = await db.webhookDelivery.updateMany({
            where: { deliveryId, status: 'RECEIVED', receivedAt: { lt: staleBefore } },
            data: { status: 'RECEIVED', errorMessage: null, processedAt: null },
        });
        return reclaimed.count > 0;
    }
    if (existing) return false;

    try {
        await db.webhookDelivery.create({
            data: { deliveryId, eventName, status: 'RECEIVED' },
        });
        return true;
    } catch (error) {
        const concurrentDelivery = await db.webhookDelivery.findUnique({ where: { deliveryId } });
        if (concurrentDelivery) return false;
        throw error;
    }
}

async function updateWebhookDelivery(
    deliveryId: string,
    status: 'PROCESSED' | 'IGNORED' | 'FAILED',
    errorMessage?: string,
): Promise<void> {
    await db.webhookDelivery.update({
        where: { deliveryId },
        data: {
            status,
            ...(errorMessage ? { errorMessage } : {}),
            ...(status === 'PROCESSED' || status === 'IGNORED' ? { processedAt: new Date() } : {}),
        },
    });
}

const defaultWebhookDeps: WebhookHandlerDeps = {
    verify: (payload, signature) => webhooks.verify(payload, signature),
    recordDelivery: recordWebhookDelivery,
    updateDelivery: updateWebhookDelivery,
    handleInstallationEvent,
    handlePullRequestEvent,
};

export const handleWebhookRequest = async (
    req: Request,
    res: Response,
    deps: WebhookHandlerDeps,
) => {
    const rawRequest = req as RawWebhookRequest;
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const deliveryId = req.headers['x-github-delivery'];

    if (
        !rawRequest.rawBody ||
        typeof signature !== 'string' ||
        typeof event !== 'string' ||
        typeof deliveryId !== 'string'
    ) {
        return res.status(400).json({ success: false, error: 'INVALID_WEBHOOK' });
    }

    const isValid = await deps.verify(rawRequest.rawBody.toString(), signature);
    if (!isValid) {
        return res.status(401).json({ success: false, error: 'INVALID_SIGNATURE' });
    }

    let isNewDelivery: boolean;
    try {
        isNewDelivery = await deps.recordDelivery(deliveryId, event);
    } catch (error) {
        console.error('Webhook delivery persistence failed:', error);
        return res.status(503).json({ success: false, error: 'WEBHOOK_STORAGE_UNAVAILABLE' });
    }

    if (!isNewDelivery) {
        return res.status(200).json({ success: true, duplicate: true });
    }

    try {
        if (event === 'installation') {
            await deps.handleInstallationEvent(req.body as InstallationPayload);
            await deps.updateDelivery(deliveryId, 'PROCESSED');
        } else if (event === 'pull_request') {
            await deps.handlePullRequestEvent(req.body as PullRequestPayload);
            await deps.updateDelivery(deliveryId, 'PROCESSED');
        } else {
            await deps.updateDelivery(deliveryId, 'IGNORED');
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await deps.updateDelivery(deliveryId, 'FAILED', message).catch(() => undefined);
        console.error('Webhook processing failed:', error);
        return res.status(500).json({ success: false, error: 'WEBHOOK_PROCESSING_FAILED' });
    }
};

export const handleWebhook = (req: Request, res: Response) =>
    handleWebhookRequest(req, res, defaultWebhookDeps);

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

function hasActiveReviewWork(session: { status: string; jobId: string | null }) {
    if (session.status === 'RUNNING' || session.status === 'COMPLETED') return true;
    return (session.status === 'QUEUED' || session.status === 'RETRYING') && Boolean(session.jobId);
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

    const prNumber = payload.number;
    const headSha = payload.pull_request.head.sha;
    const baseBranch = payload.pull_request.base.ref;
    const reviewKey = `${repo.id}:${prNumber}:${headSha}`;

    let session = await deps.db.reviewSession.findUnique({ where: { reviewKey } });
    let shouldQueue = false;

    if (session && hasActiveReviewWork(session)) {
        return;
    }

    if (session) {
        session = await deps.db.reviewSession.update({
            where: { id: session.id },
            data: {
                status: 'QUEUED',
                jobId: null,
                errorMessage: null,
                lastErrorCode: null,
                completedAt: null,
            },
        });
        shouldQueue = true;
    } else {
        try {
            session = await deps.db.reviewSession.create({
                data: {
                    repositoryId: repo.id,
                    prNumber,
                    headSha,
                    reviewKey,
                    baseBranch,
                    status: 'QUEUED',
                },
            });
            shouldQueue = true;
        } catch (error) {
            const concurrentSession = await deps.db.reviewSession.findUnique({ where: { reviewKey } });
            if (!concurrentSession) throw error;
            if (hasActiveReviewWork(concurrentSession)) return;
            session = await deps.db.reviewSession.update({
                where: { id: concurrentSession.id },
                data: {
                    status: 'QUEUED',
                    jobId: null,
                    errorMessage: null,
                    lastErrorCode: null,
                    completedAt: null,
                },
            });
            shouldQueue = true;
        }
    }

    if (!shouldQueue || !session) return;

    let jobPublished = false;

    try {
        const installationId = Number(repo.installation.githubInstallationId);
        try {
            const octokit = deps.createInstallationOctokit(installationId);
            if (session.githubLoadingCommentId) {
                await octokit.rest.issues.updateComment({
                    owner: repo.owner,
                    repo: repo.name,
                    comment_id: Number(session.githubLoadingCommentId),
                    body: '**PullRabbit** is analyzing this pull request again. An automated review will be posted as inline comments once the analysis is complete.',
                });
            } else {
                const { data: comment } = await octokit.rest.issues.createComment({
                    owner: repo.owner,
                    repo: repo.name,
                    issue_number: prNumber,
                    body: '**PullRabbit** is analyzing this pull request. An automated review will be posted as inline comments once the analysis is complete.',
                });
                await deps.db.reviewSession.update({
                    where: { id: session.id },
                    data: { githubLoadingCommentId: BigInt(comment.id) },
                });
            }
        } catch {
            // A loading comment is useful but must not prevent review processing.
        }

        const attempt = session.attemptCount + 1;
        const jobId = buildReviewJobId(session.id, attempt);
        const jobData: ReviewJobData = {
            reviewSessionId: session.id,
            reviewKey,
            repositoryId: repo.id,
            githubInstallationId: repo.installation.githubInstallationId.toString(),
            prNumber,
            headSha,
            baseBranch,
            owner: repo.owner,
            repoName: repo.name,
        };

        await deps.reviewQueue.add('review', jobData, { jobId });
        jobPublished = true;
        await deps.db.reviewSession.update({
            where: { id: session.id },
            data: { jobId },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!jobPublished) {
            await deps.db.reviewSession.updateMany({
                where: {
                    id: session.id,
                    status: { in: ['QUEUED', 'RETRYING'] },
                    jobId: null,
                },
                data: {
                    status: 'RETRYING',
                    lastErrorCode: 'QUEUE_PUBLISH_FAILED',
                    errorMessage: message,
                },
            });
        }
        throw error;
    }
}
