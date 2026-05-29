import { Router } from "express";
import { getDashboard, getReviews, getReviewById } from "../controllers/dashboard-controller/dashboard.controller";
import { dashboardReadLimiter } from "../middleware/rate-limiter.middleware";

const dashboardRouter = Router();

dashboardRouter.get("/", dashboardReadLimiter, getDashboard);
dashboardRouter.get("/reviews", dashboardReadLimiter, getReviews);
dashboardRouter.get("/reviews/:id", dashboardReadLimiter, getReviewById);

export default dashboardRouter;
