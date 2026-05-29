import { Router } from "express";
import { getInstallations } from "../controllers/setup-controller/installations.controller";
import { getInstallationRepos } from "../controllers/setup-controller/installation-repo.controller";
import { handleInstallationCallback, syncInstallationRepos } from "../controllers/github-installation/installation.controller";
import {
    installationReadLimiter,
    installationCallbackLimiter,
    syncLimiter,
} from "../middleware/rate-limiter.middleware";

const installationRouter = Router();

installationRouter.get("/", installationReadLimiter, getInstallations);
installationRouter.get("/:installationId/repos", installationReadLimiter, getInstallationRepos);
installationRouter.post("/callback", installationCallbackLimiter, handleInstallationCallback);
installationRouter.post("/:installationId/sync", syncLimiter, syncInstallationRepos);

export default installationRouter;
