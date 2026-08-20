import express from "express";
import cors from "cors";
import type { Request } from "express";
import "dotenv/config";
import { env } from "./config/env.config";
import { requestLogger } from "./middleware/logger.middleware";
import mainrouter from "./routes";

type RawBodyRequest = Request & {
    rawBody?: Buffer;
};

const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
];

export function createApp() {
    const app = express();

    app.set("trust proxy", 1);
    app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
    app.use(requestLogger);

    app.use(express.json({
        verify: (req, _res, buf) => {
            (req as RawBodyRequest).rawBody = buf;
        },
    }));

    app.use("/api/v1", mainrouter);

    return app;
}

export const app = createApp();

if (import.meta.main) {
    app.listen(env.PORT, () => {
        console.log("Server running on port", env.PORT);
    });
}
