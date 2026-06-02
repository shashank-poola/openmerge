import { Router } from "express";
import { checkHealth } from "../controllers/user-controller/health.controller";
import { login, me } from "../controllers/user-controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { signinLimiter, meLimiter } from "../middleware/rate-limiter.middleware";

const authRouter = Router();

authRouter.get("/check-health", checkHealth);
authRouter.post("/signin", signinLimiter, login);
authRouter.get("/me", meLimiter, authMiddleware, me);

export default authRouter;
