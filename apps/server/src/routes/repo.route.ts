import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getRepos, toggleRepoAutoReview } from "../controllers/repo-controller/repo.controller";
import { repoReadLimiter, repoMutateLimiter } from "../middleware/rate-limiter.middleware";

const repoRouter = Router();

repoRouter.get("/", repoReadLimiter, authMiddleware, getRepos);
repoRouter.patch("/:repoId/auto-review", repoMutateLimiter, authMiddleware, toggleRepoAutoReview);

export default repoRouter;
