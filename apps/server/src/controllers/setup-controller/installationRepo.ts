import type { Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { db } from "@repo/database";
import { githubInstallation } from "../../types/installation.type";
import { githubRepo } from "../../types/repo.type";

export const getInstallationRepos = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { installationId } = req.params;

        if (!userId) {
            res.status(401).json({ 
                success: false, 
                message: null, 
                error: 'UNAUTHORIZED' 
            })
            return;
        }

        const installation = await db.installation.findFirst({
            where: { id: installationId, userId },
        });

        if (!installation) {
            res.status(404).json({ 
                success: false, 
                message: null, 
                error: 'INSTALLATION_NOT_FOUND' 
            })
            return;
        }

        const repos = await db.repository.findMany({
            where: { 
                installationId, 
                isActive: true 
            },
            orderBy: { fullName: 'asc' },
        });

        return res.status(200).json({
            success: true,
            repos: repos.map(githubRepo),
            error: null,
        });

    } catch (err) {
        console.error('getInstallationRepos failed:', err);
        res.status(500).json({ 
            success: false, 
            message: null, 
            error: 'FAILED_FETCHING_REPOS' 
        })
        return;
    }
};