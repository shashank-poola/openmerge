import { Router } from "express";
import authRouter from "./auth.route";
import installationRouter from "./installation.route";
import repoRouter from "./repo.route";
import dashboardRouter from "./dashboard.route";
import webhookRouter from "./webhook.route";

const mainrouter = Router();

mainrouter.use("/auth", authRouter);
mainrouter.use("/installations", installationRouter);
mainrouter.use("/repos", repoRouter);
mainrouter.use("/dashboard", dashboardRouter);
mainrouter.use("/webhook", webhookRouter);

export default mainrouter;
