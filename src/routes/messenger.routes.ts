import { Router, Request, Response } from "express";
import {messengerService} from "../services";
import config from "../config";
import {handleWrapper} from "./utils";

const router = Router();
const subRouter = Router();

router.use('/chat', (req, res, next) => {
    if (req.header('x-api-key') === config.apiKey) {
        next();
    } else {
        const msg = 'Unauthorized';
        res.statusCode = 401;
        res.send(msg);
    }
}, subRouter)

subRouter.get("/info", async (req: Request, res: Response) => {
    await handleWrapper(async () => await messengerService.getInfo(), res)
});

subRouter.post("/users", async (req: Request, res: Response) => {
    await handleWrapper(async () => await messengerService.addUser(req.body), res)
});

subRouter.delete("/users/:phone", async (req: Request, res: Response) => {
    await handleWrapper(async () => await messengerService.deleteUser(req.params.phone), res)
});

export { router }
