import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getInstallations } from "../controllers/setup-controller/installations";
import { getInstallationRepos } from "../controllers/setup-controller/installationRepo";
import { handleInstallationCallback, syncInstallationRepos } from "../controllers/github-installation/installation.github";

const installationRouter = Router();

installationRouter.get("/", authMiddleware, getInstallations);
installationRouter.get("/:installationId/repos", authMiddleware, getInstallationRepos);
installationRouter.post("/callback", authMiddleware, handleInstallationCallback);
installationRouter.post("/:installationId/sync", authMiddleware, syncInstallationRepos);

export default installationRouter;
