import express from "express";
import type { Express } from "express";
import type {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import {config} from "dotenv";
config ({path: path.resolve("./config/.env.dev")});
import authRouter from "./Modules/Auth/auth.controller";
import { globalErrorHandler } from "./Utiles/response/error.response";
import connectDB from "./DB/models/connection";
import userRouter from "./Modules/User/user.controller";
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit : 100,
    message :{
        status: 429,
        message : "Too many requests , Please Try Again later"
    }

})

export const bootstrap = async () => {
    const app: Express = express();
    const port: number = Number(process.env.PORT) || 5000;

    app.use(cors(), express.json(), helmet());
    app.use(limiter);
    await connectDB();
    app.get("/", (req: Request, res: Response) =>{
        res.status(200).json({message :"Welcome to Socail Media App"});
    });
    
    app.use("/api/v1/auth", authRouter)
    app.use("/api/v1/user", userRouter)

    app.use("{/*dummy}", (req: Request, res: Response) =>{
        res.status(404).json({message :"Not Found Handler"});
    });


    app.use(globalErrorHandler);

    app.listen(port,() => {
        console.log(`Server is Running on http://localhost:${port}`);
    });

};
export default bootstrap;
