import {type Request, type Response} from 'express';
import {makeAuthClusterCookieName, sendError, sendResponse} from '../utils';
import {getVersions} from '../components/cluster-queries';
import {getClustersFromConfig} from '../components/utils';

export function clusterVersions(req: Request, res: Response) {
    const clusters = getClustersFromConfig();

    getVersions(req, clusters)
        .then((data: {}) => sendResponse(res, data))
        .catch((error: any) => sendError(res, error));
}

type ClusterAuthStatus = Record<string, {authorized: boolean}>;

export function clusterAuthStatus(req: Request, res: Response) {
    const allowPasswordAuth = req.ctx.config.allowPasswordAuth;

    let data = {};

    if (allowPasswordAuth) {
        const clusters = getClustersFromConfig();

        data = Object.keys(clusters).reduce((accRet, cluster) => {
            accRet[cluster] = {
                authorized: Boolean(req.cookies[makeAuthClusterCookieName(cluster)]),
            };

            return accRet;
        }, {} as ClusterAuthStatus);
    } else {
        const clusters = getClustersFromConfig();

        data = Object.keys(clusters).reduce((accRet, clusterName) => {
            accRet[clusterName] = {authorized: true};

            return accRet;
        }, {} as ClusterAuthStatus);
    }

    sendResponse(res, data);
}
