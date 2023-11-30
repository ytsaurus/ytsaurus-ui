import type {Request} from 'express';
import {AppMiddleware} from '@gravity-ui/expresskit';
import {AuthWay} from '../../shared/constants';
import {isUserOAuthLogged} from '../components/oauth';

export function isAuthorized(req: Request) {
    if (req.yt) {
        return Boolean(Object.keys(req.yt.ytApiAuthHeaders ?? {}));
    }
    return false;
}

export function getAuthWay(req: Request): AuthWay | undefined {
    if (!isAuthorized(req)) {
        return undefined;
    }
    if (isUserOAuthLogged(req)) {
        return 'oauth';
    }
    return 'passwd';
}

export function authorizationResolver(resolver: AppMiddleware): AppMiddleware {
    return (req, res, next) => {
        if (isAuthorized(req)) {
            next();
            return;
        }
        resolver(req, res, next);
        return;
    };
}
