import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getDashboard, getReviews, getReviewById } from "../controllers/dashboard-controller/dashboard.controller";
import { dashboardReadLimiter } from "../middleware/rate-limiter.middleware";

const dashboardRouter = Router();

dashboardRouter.get("/", dashboardReadLimiter, authMiddleware, getDashboard);
dashboardRouter.get("/reviews", dashboardReadLimiter, authMiddleware, getReviews);
dashboardRouter.get("/reviews/:id", dashboardReadLimiter, authMiddleware, getReviewById);

export default dashboardRouter;
