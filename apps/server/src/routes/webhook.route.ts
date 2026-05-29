import { Router } from "express";
import { handleWebhook } from "../controllers/webhook-controller/webhook.controller";
import { webhookLimiter } from "../middleware/rate-limiter.middleware";

const webhookRouter = Router();

webhookRouter.post("/github", webhookLimiter, handleWebhook);

export default webhookRouter;
