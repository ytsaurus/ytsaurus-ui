import type {Request, Response} from 'express';
import {AppMiddleware} from '@gravity-ui/expresskit';
import {YT_CYPRESS_COOKIE_NAME, YT_UI_CLUSTER_HEADER_NAME} from '../../shared/constants';
import {makeAuthClusterCookieName} from '../utils';

export function createYTAuthorizationResolver(): AppMiddleware {
    return async function resolveYTAuthorization(req: Request, res: Response, next) {
        const {ytAuthCluster} = req.params;

        const secret: string = req.cookies[makeAuthClusterCookieName(ytAuthCluster)];

        if (ytAuthCluster) {
            res.setHeader(YT_UI_CLUSTER_HEADER_NAME, ytAuthCluster);
        }

        req.yt = {
            ytApiAuthHeaders: {
                Cookie: `${YT_CYPRESS_COOKIE_NAME}=${secret};`,
            },
        };

        next();
    };
}
