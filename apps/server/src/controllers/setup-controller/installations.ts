import type { Response } from 'express';
import { db } from '@repo/database';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { githubInstallation } from '../../types/installation.type';

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
