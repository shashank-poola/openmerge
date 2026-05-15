import { Router } from "express"
import authRouter from "./auth.route";
import setupRouter from "./setup.route";
import installationRouter from "./installation.route";
import webhookRouter from "./webhook.route";
import dashboardRouter from "./dashboard.route";

const mainrouter = Router();

mainrouter.use("/auth", authRouter);
mainrouter.use("/");
mainrouter.use("/", setupRouter);
mainrouter.use("/installations", installationRouter)
mainrouter.use("/webhook", webhookRouter);
mainrouter.use("/dashboard", dashboardRouter)

export default mainrouter;