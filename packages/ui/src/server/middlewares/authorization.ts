import axios from 'axios';
import {isAuthorized} from '../utils/authorization';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {AppMiddleware} from '@gravity-ui/expresskit';
import {getXSRFToken} from '../components/cluster-queries';
import {sendError} from '../utils';

class AuthError extends Error {
    constructor() {
        super('Authorization required');
    }
}

function isAuthError(e: unknown) {
    return e instanceof AuthError || (axios.isAxiosError(e) && e.response?.status === 401);
}

export function createAuthMiddleware(ytAuthCluster: string): AppMiddleware {
    return async function authMiddleware(req, res, next) {
        try {
            if (!isAuthorized(req)) {
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
