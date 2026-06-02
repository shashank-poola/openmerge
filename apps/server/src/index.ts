import express from "express";
import cors from "cors";
import "dotenv/config";
import { env } from "./config/env.config";
import { requestLogger } from "./middleware/logger.middleware";
import mainrouter from "./routes";

const app = express();

const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
];

app.set("trust proxy", 1);
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(requestLogger);

app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    },
}));

app.use("/api/v1", mainrouter);

app.listen(env.PORT, () => {
    console.log("Server running on port", env.PORT);
});
