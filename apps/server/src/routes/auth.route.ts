import { Router } from "express";
import { checkHealth } from "../controllers/user-controller/health.controller";
import { login, me } from "../controllers/user-controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.get("/check-health", checkHealth);
authRouter.post("/signin", login);
authRouter.get("/me", authMiddleware, me);

export default authRouter;
