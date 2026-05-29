import type { Response } from 'express';
import { db } from '@repo/database';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { githubRepo } from '../../types/repo.type';

export const getRepos = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
            return;
        }

        const repos = await db.repository.findMany({
            where: { installation: { userId }, isActive: true },
            orderBy: { fullName: 'asc' },
        });

        return res.status(200).json({ success: true, repos: repos.map(githubRepo), error: null });
    } catch (err) {
        console.error('getRepos failed:', err);
        res.status(500).json({ success: false, message: null, error: 'FAILED_FETCHING_REPOS' });
        return;
    }
};

export const toggleRepoAutoReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const repoId = typeof req.params.repoId === 'string' ? req.params.repoId : null;
        const { autoReviewEnabled } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
            return;
        }

        if (!repoId) {
            res.status(400).json({ success: false, message: null, error: 'INVALID_PARAMS' });
            return;
        }

        if (typeof autoReviewEnabled !== 'boolean') {
            res.status(400).json({ success: false, message: null, error: 'INVALID_PAYLOAD' });
            return;
        }

        const repo = await db.repository.findFirst({
            where: { id: repoId, installation: { userId } },
        });

        if (!repo) {
            res.status(404).json({ success: false, message: null, error: 'REPO_NOT_FOUND' });
            return;
        }

        const updated = await db.repository.update({
            where: { id: repoId },
            data: { autoReviewEnabled },
        });

        return res.status(200).json({ success: true, repo: githubRepo(updated), error: null });
    } catch (err) {
        console.error('toggleRepoAutoReview failed:', err);
        return res.status(500).json({ success: false, message: null, error: 'FAILED_UPDATING_REPO' });
    }
};
