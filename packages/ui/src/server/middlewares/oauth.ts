import {AppMiddleware} from '@gravity-ui/expresskit';
import type {Request, Response} from 'express';
import {getOAuthAccessToken, isOAuthAllowed, isUserOAuthLogged} from '../components/oauth';

export function createOAuthAuthorizationResolver(): AppMiddleware {
    return async function resoleOAuthAuthorize(req: Request, res: Response, next) {
        if (!isOAuthAllowed(req) || !isUserOAuthLogged(req)) {
            next();
            return;
        }
        try {
            const token = await getOAuthAccessToken(req, res);
            req.yt = {
                ytApiAuthHeaders: {
                    Authorization: `OAuth ${token}`,
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
