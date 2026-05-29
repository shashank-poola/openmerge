import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getInstallations } from "../controllers/setup-controller/installations.controller";
import { getInstallationRepos } from "../controllers/setup-controller/installation-repo.controller";
import { handleInstallationCallback, syncInstallationRepos } from "../controllers/github-installation/installation.controller";
import {
    installationReadLimiter,
    installationCallbackLimiter,
    syncLimiter,
} from "../middleware/rate-limiter.middleware";

const installationRouter = Router();

installationRouter.get("/", installationReadLimiter, authMiddleware, getInstallations);
installationRouter.get("/:installationId/repos", installationReadLimiter, authMiddleware, getInstallationRepos);
installationRouter.post("/callback", installationCallbackLimiter, authMiddleware, handleInstallationCallback);
installationRouter.post("/:installationId/sync", syncLimiter, authMiddleware, syncInstallationRepos);

export default installationRouter;
