import { Router } from "express";
import { getRepos, toggleRepoAutoReview } from "../controllers/repo-controller/repo.controller";
import { repoReadLimiter, repoMutateLimiter } from "../middleware/rate-limiter.middleware";

const repoRouter = Router();

repoRouter.get("/", repoReadLimiter, getRepos);
repoRouter.patch("/:repoId/auto-review", repoMutateLimiter, toggleRepoAutoReview);

export default repoRouter;
