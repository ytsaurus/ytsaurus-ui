import type {Request, Response} from 'express';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {sendError, sendResponse} from '../utils';

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
        data = Object.keys(req.cookies).reduce((ret, key) => {
            if (key.includes(YT_CYPRESS_COOKIE_NAME)) {
                const [cluster] = key.split(':');

                ret[cluster] = {
                    authorized: true,
                };
            }

            return ret;
        }, {} as ClusterAuthStatus);
    } else {
        const clusters = getClustersFromConfig();

        data = Object.keys(clusters).reduce((ret, clusterName) => {
            ret[clusterName] = {authorized: true};

            return ret;
        }, {} as ClusterAuthStatus);
    }

    sendResponse(res, data);
}
