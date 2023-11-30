import type {Request, Response} from 'express';
import {AppMiddleware} from '@gravity-ui/expresskit';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';

export function createYTAuthorizationResolver(): AppMiddleware {
    return async function resoleOAuthAuthorize(req: Request, _: Response, next) {
        const secret: string = req.cookies[YT_CYPRESS_COOKIE_NAME];
        req.yt = {
            ytApiAuthHeaders: {
                Cookie: `${YT_CYPRESS_COOKIE_NAME}=${secret};`,
            },
        };
        next();
    };
}
