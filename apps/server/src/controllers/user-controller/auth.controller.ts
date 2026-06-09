import type { Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import { db } from "@repo/database";
import { githubUser } from '../../types/user.type';
import { env } from '../../config/env.config';
import { upsertUserFromGithubData } from '../../utils/user.utils';
import { userSchema } from '../../schema/user.schema';

const SERVER_JWT_SECRET = env.SERVER_JWT_SECRET;

export const login = async (req: Request, res: Response) => {
    const { user } = req.body;

    try {
        const parsedUser = userSchema.parse({
            githubUserId: user?.githubUserId,
            githubLogin: user?.githubLogin,
            email: user?.email,
            name: user?.name,
            avatarUrl: user?.avatarUrl,
        });

        const myUser = await db.user.upsert({
            where: {
                githubLogin: parsedUser.githubLogin,
            },
            create: {
                githubUserId: parsedUser.githubUserId,
                githubLogin: parsedUser.githubLogin,
                email: parsedUser.email,
                name: parsedUser.name,
                avatarUrl: parsedUser.avatarUrl,
            },
            update: {
                githubUserId: parsedUser.githubUserId,
                email: parsedUser.email,
                name: parsedUser.name,
                avatarUrl: parsedUser.avatarUrl,
            },
        });

        const jwtPayload = {
            name: myUser.name,
            email: myUser.email,
            userId: myUser.id,
            githubLogin: myUser.githubLogin,
        };

        const secret = SERVER_JWT_SECRET;
        if (!secret) {
            res.status(500).json({
                success: false,
                message: null,
                error: "SECRET_INVALID"
            });
            return;
        }

        const token = jwt.sign(
            jwtPayload, secret, { 
                expiresIn: '7d' 
        });

        return res.json({
            success: true,
            user: githubUser(myUser),
            token: token,
        });

    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({
            success: false,
            message: null,
            error: 'AUTHENTICATION_FAILED',
        });
        return;
    }
}

export const githubStart = (_req: Request, res: Response) => {
    const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: env.GITHUB_CALLBACK_URL,
        scope: 'user:email read:user',
    });
    return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

export const githubExchange = async (req: Request, res: Response) => {
    try {
        const { code } = req.body as { code?: string };
        if (!code) {
            return res.status(400).json({ success: false, error: 'MISSING_CODE' });
        }

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SERVER,
                code,
                redirect_uri: env.GITHUB_CALLBACK_URL,
            }),
        });

        if (!tokenRes.ok) {
            return res.status(502).json({ success: false, error: 'TOKEN_EXCHANGE_FAILED' });
        }

        const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
        if (!tokenData.access_token || tokenData.error) {
            return res.status(401).json({ success: false, error: tokenData.error ?? 'TOKEN_NOT_RECEIVED' });
        }

        const profileRes = await fetch('https://api.github.com/user', {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'pullrabbit-server',
            },
        });

        if (!profileRes.ok) {
            return res.status(502).json({ success: false, error: 'FAILED_FETCHING_PROFILE' });
        }

        const profile = await profileRes.json() as {
            id: number | string;
            login: string;
            email?: string | null;
            name?: string | null;
            avatar_url?: string | null;
        };

        const parsedUser = userSchema.parse({
            githubUserId: profile.id,
            githubLogin: profile.login,
            email: profile.email ?? null,
            name: profile.name ?? null,
            avatarUrl: profile.avatar_url ?? null,
        });

        const myUser = await upsertUserFromGithubData(parsedUser);
        const token = jwt.sign({
            name: myUser.name,
            email: myUser.email,
            userId: myUser.id,
            githubLogin: myUser.githubLogin,
        }, SERVER_JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            user: githubUser(myUser),
            token,
        });

    } catch (err) {
        console.error('GitHub exchange failed:', err);
        return res.status(500).json({ success: false, error: 'EXCHANGE_FAILED' });
    }
};

export const githubCallback = async (req: Request, res: Response) => {
    try {
        const code = typeof req.query.code === 'string' ? req.query.code : null;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: null,
                error: "MISSING_OAUTH_TOKEN",
            });
        }

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SERVER,
                code,
            }),
        });

        if (!tokenRes.ok) {
            console.log("failed to exchange Github code")
            return res.status(502).json({
                success: false,
                message: null,
                error: "TOKEN_EXCHANGE_FAILED",
            });
        }

        const tokenData = await tokenRes.json() as { access_token?: string };
        if (!tokenData.access_token) {
            return res.status(401).json({
                success: false,
                message: null,
                error: "TOKEN_NOT_RECEIVED",
            });
        }

        const profileRes = await fetch('https://api.github.com/user', {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'pullrabbit-server',
            },
        });

        if (!profileRes.ok) {
            console.log("failed to fetch Github profile")
            return res.status(502).json({
                success: false,
                message: null,
                error: "FAILED_FETCHING_PROFILE",
            });
        }

        const profile = await profileRes.json() as {
            id: number | string;
            login: string;
            email?: string | null;
            name?: string | null;
            avatar_url?: string | null;
        };

        const parsedUser = userSchema.parse({
            githubUserId: profile.id,
            githubLogin: profile.login,
            email: profile.email ?? null,
            name: profile.name ?? null,
            avatarUrl: profile.avatar_url ?? null,
        });

        const myUser = await upsertUserFromGithubData(parsedUser);
        const token = jwt.sign({
            name: myUser.name,
            email: myUser.email,
            userId: myUser.id,
            githubLogin: myUser.githubLogin,
        }, SERVER_JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            user: githubUser(myUser),
            token,
        });

    } catch (err) {
        console.error('GitHub callback failed:', err);
        return res.status(500).json({
            success: false,
            message: null,
            error: "AUTHENTICATION_FAILED",
        });
    }
}

export const me = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: null,
                error: "UNAUTHORIZED"
            });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: null,
                error: "USER_NOT_FOUND"
            });
        }

        return res.status(200).json({
            success: true,
            user: githubUser(user),
            error: null,
        });

    } catch (err) {
        console.error('Me endpoint failed:', err);
        return res.status(500).json({
            success: false,
            message: null,
            error: "FAILED_FETCHING_USER"
        });
    }
}