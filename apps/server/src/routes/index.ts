import { Router } from "express"
import authRouter from "./auth.route";
import setupRouter from "./setup.route";
import installationRouter from "./installation.route";

const mainrouter = Router();

mainrouter.use("/auth", authRouter);
mainrouter.use("/");
mainrouter.use("/", setupRouter);
mainrouter.use("/installations", installationRouter)

export default mainrouter;