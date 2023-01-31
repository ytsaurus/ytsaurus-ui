import axios from 'axios';

import {AppMiddleware} from '@gravity-ui/expresskit';

import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {getXSRFToken} from '../components/cluster-queries';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {sendError} from '../utils';

class AuthError extends Error {
    constructor() {
        super('Authorization required');
    }
}

function isAuthError(e: unknown) {
    return e instanceof AuthError || (axios.isAxiosError(e) && e.response?.status === 401);
}

export function createYTAuthMiddleware(ytAuthCluster: string): AppMiddleware {
    return async function ytAuthMiddleware(req, res, next) {
        try {
            const secret: string = req.cookies[YT_CYPRESS_COOKIE_NAME];

            req.yt = {
                ytApiAuthHeaders: {
                    Cookie: `${YT_CYPRESS_COOKIE_NAME}=${secret};`,
                },
            };

            if (!secret) {
                throw new AuthError();
            }

            const cfg = getUserYTApiSetup(ytAuthCluster, req);
            const {login} = await getXSRFToken(req, cfg);
            req.yt.login = login;
        } catch (e) {
            const isAuthFailed = isAuthError(e);
            const error = isAuthFailed ? undefined : e;

            if (!req.routeInfo.ui && isAuthFailed) {
                sendError(res, error, 401);
                return;
            }
        }

        next();
    };
}
