import { Router } from "express";
import { handleWebhook } from "../controllers/webhook-controller/webhook.controller";

const webhookRouter = Router();

webhookRouter.post("/github", handleWebhook);

export default webhookRouter;
