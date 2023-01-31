import type {Request, Response} from 'express';
import {sendError, sendResponse} from '../utils';

import {getVersions} from '../components/cluster-queries';
import {getClustersFromConfig} from '../components/utils';

export function clusterVersions(req: Request, res: Response) {
    const clusters = getClustersFromConfig();

    getVersions(req, clusters)
        .then((data: {}) => sendResponse(res, data))
        .catch((error: any) => sendError(res, error));
}
