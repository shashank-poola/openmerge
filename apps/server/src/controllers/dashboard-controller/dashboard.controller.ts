import type { Response } from 'express';
import { db } from '@repo/database';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { githubInstallation } from '../../types/installation.type';
import { githubRepo } from '../../types/repo.type';
import { reviewSession } from '../../types/review.type';
import { reviewComment } from '../../types/reviewComment.type';

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

export const getReviews = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
        }

        const page = Math.max(1, parseInt(typeof req.query.page === 'string' ? req.query.page : '1') || 1);
        const limit = 20;
        const skip = (page - 1) * limit;

        const where = {
            repository: {
                installation: { userId },
            },
        };

        const reviewsP = db.reviewSession.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                repository: {
                    select: { id: true, fullName: true, owner: true, name: true },
                },
            },
        });
        const totalP = db.reviewSession.count({ where });
        const reviews = await reviewsP;
        const total = await totalP;

        return res.status(200).json({
            success: true,
            reviews: reviews.map((r) => ({
                ...reviewSession(r),
                repository: r.repository,
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            error: null,
        });

    } catch (err) {
        console.error('getReviews failed:', err);
        return res.status(500).json({ success: false, message: null, error: 'FAILED_FETCHING_REVIEWS' });
    }
};

export const getReviewById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const id = typeof req.params.id === 'string' ? req.params.id : null;

        if (!userId) {
            return res.status(401).json({ success: false, message: null, error: 'UNAUTHORIZED' });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: null, error: 'INVALID_PARAMS' });
        }

        const review = await db.reviewSession.findFirst({
            where: {
                id,
                repository: {
                    installation: { userId },
                },
            },
            include: {
                repository: {
                    select: { id: true, fullName: true, owner: true, name: true },
                },
                comments: {
                    orderBy: [{ filePath: 'asc' }, { line: 'asc' }],
                },
            },
        }) as (Awaited<ReturnType<typeof db.reviewSession.findFirst>> & {
            repository: { id: string; fullName: string; owner: string; name: string };
            comments: Parameters<typeof reviewComment>[0][];
        }) | null;

        if (!review) {
            return res.status(404).json({ success: false, message: null, error: 'REVIEW_NOT_FOUND' });
        }

        return res.status(200).json({
            success: true,
            review: {
                ...reviewSession(review),
                repository: review.repository,
                comments: review.comments.map(reviewComment),
            },
            error: null,
        });

    } catch (err) {
        console.error('getReviewById failed:', err);
        return res.status(500).json({ success: false, message: null, error: 'FAILED_FETCHING_REVIEW' });
    }
};
