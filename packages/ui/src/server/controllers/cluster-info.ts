import type {Request, Response} from 'express';
import {getClusterInfo} from '../components/cluster-queries';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {sendAndLogError} from '../utils';

async function handleClusterInfoImpl(req: Request, res: Response) {
    try {
        const {
            params: {ytAuthCluster},
        } = req;

        const cfg = getUserYTApiSetup(ytAuthCluster, req);

        const results = await getClusterInfo(req, cfg);
        return res.send(results);
    } catch (err: any) {
        return sendAndLogError(req.ctx, res, 500, err);
    }
}

export async function handleClusterInfo(req: Request, res: Response) {
    await handleClusterInfoImpl(req, res);
}
