import type {Request, Response} from 'express';
import {AppMiddleware} from '@gravity-ui/expresskit';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';

export const findClusterByCookie = (cookies: Record<string, string[]>): string | undefined => {
    for (const key in cookies) {
        if (key !== YT_CYPRESS_COOKIE_NAME && cookies[key] === cookies[YT_CYPRESS_COOKIE_NAME]) {
            const [ytAuthCluster] = key.split(':');

            return ytAuthCluster;
        }
    }

    return undefined;
};

export function createYTAuthorizationResolver(): AppMiddleware {
    return async function resolveYTAuthorization(req: Request, _: Response, next) {
        const {ytAuthCluster = findClusterByCookie(req.cookies)} = req.params;

        const secret: string = req.cookies[`${ytAuthCluster}:${YT_CYPRESS_COOKIE_NAME}`];

        req.yt = {
            ytApiAuthHeaders: {
                Cookie: `${YT_CYPRESS_COOKIE_NAME}=${secret};`,
            },
        };

        next();
    };
}
