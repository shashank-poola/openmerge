import type { Response } from 'express';
import { db } from '@repo/database';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { githubInstallation } from '../../types/installation.type';
import { githubRepo } from '../../types/repo.type';

export const getDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
        }

        const installations = await db.installation.findMany({
            where: { userId, status: { not: 'REMOVED' } },
            include: {
                repositories: {
                    where: { isActive: true },
                    include: {
                        reviewSessions: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                            select: {
                                id: true,
                                prNumber: true,
                                status: true,
                                totalComments: true,
                                createdAt: true,
                                completedAt: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const data = installations.map((inst) => ({
            ...githubInstallation(inst),
            repositories: inst.repositories.map((repo) => ({
                ...githubRepo(repo),
                recentReviews: repo.reviewSessions,
            })),
        }));

        return res.status(200).json({ 
            success: true, 
            installations: data, 
            error: null 
        });
    } catch (err) {
        console.error('getDashboard failed:', err);

        return res.status(500).json({ 
            success: false, 
            message: null, 
            error: 'FAILED_FETCHING_DASHBOARD' 
        });
    }
};
