import type {Request, Response} from 'express';

export function ping(_req: Request, res: Response) {
    res.send({result: 'pong'});
}
