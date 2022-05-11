//helpers
import {Response} from "express";

interface Action
{
    (): any;
}

const handleWrapper = ( async (action: Action, res: Response) => {
    try {
        const result = await action()
        res.json(result);
    } catch (e) {
        res.statusCode = 500;
        res.send(e.message || e);
    }
})

export {handleWrapper}
