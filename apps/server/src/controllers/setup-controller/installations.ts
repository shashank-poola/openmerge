import type { Response } from 'express';
import { db } from '@repo/database';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { githubInstallation } from '../../types/installation.type';
import { githubRepo } from '../../types/repo.type';

export const getInstallations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ 
                success: false, 
                message: null, 
                error: 'UNAUTHORIZED' 
            })
            return;
        }

        const installations = await db.installation.findMany({
            where: { 
                userId, 
                status: { 
                    not: 'REMOVED' 
                } 
            },
            orderBy: { 
                createdAt: 'desc' 
            },
        });

        return res.status(200).json({
            success: true,
            installations: installations.map(githubInstallation),
            error: null,
        });

    } catch (err) {
        console.error('getInstallations failed:', err);
        res.status(500).json({ 
            success: false, 
            message: null, 
            error: 'FAILED_FETCHING_INSTALLATIONS' 
        })
        return;
    }
};

export const toggleRepoAutoReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { repoId } = req.params;
        const { autoReviewEnabled } = req.body;

        if (!userId) {
            res.status(401).json({ 
                success: false, 
                message: null, 
                error: 'UNAUTHORIZED' 
            })
            return;
        }

        if (typeof autoReviewEnabled !== 'boolean') {
            res.status(400).json({ 
                success: false, 
                message: null, 
                error: 'INVALID_PAYLOAD' 
            })
            return;
        }

        const repo = await db.repository.findFirst({
            where: { 
                id: repoId, 
                installation: { 
                    userId 
                } 
            },
        });

        if (!repo) {
            res.status(404).json({ 
                success: false, 
                message: null, 
                error: 'REPO_NOT_FOUND' 
            })
            return;
        }

        const updated = await db.repository.update({
            where: { 
                id: repoId 
            },
            data: { autoReviewEnabled },
        });

        return res.status(200).json({ 
            success: true, 
            repo: githubRepo(updated), 
            error: null 
        });
    } catch (err) {
        console.error('toggleRepoAutoReview failed:', err);
        return res.status(500).json({ 
            success: false, 
            message: null, 
            error: 'FAILED_UPDATING_REPO' 
        });
    }
};
