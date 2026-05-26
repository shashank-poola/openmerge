import { Router } from "express";
import { checkHealth } from "../controllers/user-controller/health.controller";
import { login } from "../controllers/user-controller/auth.controller";

const authRouter = Router();

authRouter.get("/check-health", checkHealth);
authRouter.post("/signin", login)

export default authRouter;