import {type Request, type Response} from 'express';

export function ping(_req: Request, res: Response) {
    res.send({result: 'pong'});
}
