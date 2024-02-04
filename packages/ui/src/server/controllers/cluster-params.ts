import type {AxiosError} from 'axios';
import type {Request, Response} from 'express';

import {getPreloadedClusterParams} from '../components/cluster-params';
import {sendAndLogError} from '../utils';

export async function clusterParams(req: Request, res: Response) {
    try {
        const response = await getPreloadedClusterParams(req.params.ytAuthCluster, req.ctx);
        res.status(200).send(response);
    } catch (error) {
        sendAndLogError(req.ctx, res, 500, error as Error | AxiosError);
    }
}
