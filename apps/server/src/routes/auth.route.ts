import { Router } from "express";
import { checkHealth } from "../controllers/user-auth/health.controller";
import { login } from "../controllers/user-auth/auth.controller";

const authRouter = Router();

authRouter.get("/check-health", checkHealth);
authRouter.post("/signin", login)

export default authRouter;