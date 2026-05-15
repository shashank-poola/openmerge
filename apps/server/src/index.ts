import express from "express";
import cors from "cors";
import "dotenv/config"
import mainrouter from "./routes";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors())

const ALLOWED_ORIGINS = [
    "http://localhost:3000"
]

app.use("/api/v1", mainrouter)

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT)
});