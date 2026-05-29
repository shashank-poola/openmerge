import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  userId?: string;
}

const JWT_SECRET = env.SERVER_JWT_SECRET;

export const authMiddleware = async ( req: AuthRequest, res: Response, next: NextFunction ) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: null,
      error: "TOKEN_REQUIRED",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    req.user = payload;
    req.userId = payload.userId;
    next();

  } catch {
    res.status(401).json({
      success: false,
      message: null,
      error: "INVALID_TOKEN",
    });
    return;
  }
};

export function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}
  
