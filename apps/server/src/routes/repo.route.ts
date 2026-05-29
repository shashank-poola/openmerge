import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getRepos, toggleRepoAutoReview } from "../controllers/repo-controller/repo.controller";

const repoRouter = Router();

repoRouter.get("/", authMiddleware, getRepos);
repoRouter.patch("/:repoId/auto-review", authMiddleware, toggleRepoAutoReview);

export default repoRouter;
