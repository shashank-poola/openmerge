import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import authRouter from "./auth.route";
import installationRouter from "./installation.route";
import repoRouter from "./repo.route";
import dashboardRouter from "./dashboard.route";
import webhookRouter from "./webhook.route";

const mainrouter = Router();

mainrouter.use("/auth", authRouter);
mainrouter.use("/webhook", webhookRouter);

mainrouter.use(authMiddleware);

mainrouter.use("/installations", installationRouter);
mainrouter.use("/repos", repoRouter);
mainrouter.use("/dashboard", dashboardRouter);

export default mainrouter;
