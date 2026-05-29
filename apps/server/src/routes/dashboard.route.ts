import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getDashboard, getReviews, getReviewById } from "../controllers/dashboard-controller/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/", authMiddleware, getDashboard);
dashboardRouter.get("/reviews", authMiddleware, getReviews);
dashboardRouter.get("/reviews/:id", authMiddleware, getReviewById);

export default dashboardRouter;
