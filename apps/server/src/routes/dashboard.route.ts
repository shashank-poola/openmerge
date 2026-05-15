import { Router } from "express";

const dashboardRouter = Router();

dashboardRouter.get("/prs");
dashboardRouter.get("/prs/:id");

export default dashboardRouter;