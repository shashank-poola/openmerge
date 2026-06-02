import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import jwt from "jsonwebtoken";

const TOO_MANY = { success: false, message: null, error: "TOO_MANY_REQUESTS" };

const userOrIpKey = (req: Request): string => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
        try {
            const decoded = jwt.decode(auth.slice(7)) as { userId?: string } | null;
            if (decoded?.userId) return `user:${decoded.userId}`;
        } catch {}
    }
    return ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "127.0.0.1");
};

export const signinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: TOO_MANY,
});

export const meLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const installationCallbackLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const installationReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const repoReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const repoMutateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const dashboardReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    message: TOO_MANY,
});

export const webhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: TOO_MANY,
});
