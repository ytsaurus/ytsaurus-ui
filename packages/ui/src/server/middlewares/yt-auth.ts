import axios from 'axios';

import {AppMiddleware} from '@gravity-ui/expresskit';

import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {getXSRFToken} from '../components/cluster-queries';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {sendError} from '../utils';
import {YtauthConfig} from '../../@types/core';
import {BadTokenError, ytauthAuthenticate} from '../controllers/ytauth';

class AuthError extends Error {
    constructor() {
        super('Authorization required');
    }
}

function isAuthError(e: unknown) {
    return (
        e instanceof AuthError ||
        e instanceof BadTokenError ||
        (axios.isAxiosError(e) && e.response?.status === 401)
    );
}

export function createYTAuthMiddleware(
    ytAuthCluster: string,
    ytauthConfig?: YtauthConfig,
): AppMiddleware {
    if (!ytAuthCluster && !ytauthConfig) {
        throw new Error('Required to pass at least one of [ytAuthCluster, ytauthConfig]');
    }
    return async function ytAuthMiddleware(req, res, next) {
        try {
            if (ytauthConfig && req.cookies[ytauthConfig.ytauthCookieName]) {
                const secret: string = req.cookies[ytauthConfig.ytauthCookieName];
                const userInfo = await ytauthAuthenticate(ytauthConfig, secret, req.ctx);

                req.yt = {
                    login: userInfo.username,
                    ytApiAuthHeaders: {
                        Cookie: `${ytauthConfig.ytauthCookieName}=${secret};`,
                    },
                    userInfo: userInfo,
                };
            } else {
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
            }
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
