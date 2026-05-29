import express from "express";
import cors from "cors";
import "dotenv/config"
import mainrouter from "./routes";

const app = express();
const PORT = process.env.PORT;

const ALLOWED_ORIGINS = ["http://localhost:3000"];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    },
}));

app.use("/api/v1", mainrouter);

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});