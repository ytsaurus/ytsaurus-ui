import {AppMiddleware} from '@gravity-ui/expresskit';
import type {Request, Response} from 'express';
import {getOAuthAccessToken, isOAuthAllowed, isUserOAuthLogged} from '../components/oauth';
import {YT_UI_CLUSTER_HEADER_NAME} from '../../shared/constants';

export function createOAuthAuthorizationResolver(): AppMiddleware {
    return async function resoleOAuthAuthorize(req: Request, res: Response, next) {
        if (!isOAuthAllowed(req) || !isUserOAuthLogged(req)) {
            next();
            return;
        }
        try {
            const {ytAuthCluster} = req.params;

            if (ytAuthCluster) {
                res.setHeader(YT_UI_CLUSTER_HEADER_NAME, ytAuthCluster);
            }

            const token = await getOAuthAccessToken(req, res);
            req.yt = {
                ytApiAuthHeaders: {
                    Cookie: `access_token=${token}`,
                },
            };
            req.ctx.log('OAuth: provide a token');
        } catch (e) {
            req.ctx.logError('Can not resolve access token', e);
        }
        next();
        return;
    };
}
