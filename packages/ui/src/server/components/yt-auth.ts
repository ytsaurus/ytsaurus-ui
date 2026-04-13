import {AppConfig} from '@gravity-ui/nodekit';
import type {Request, Response} from 'express';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {getClustersFromConfig} from './utils';
import {makeAuthClusterCookieName} from '../utils';
import {makeAuthCookieOptions, replaceDomainForSetCookie} from '../utils/cookie';

export function isYtAuthEnabled(config: AppConfig) {
    return Boolean(config.allowPasswordAuth);
}

export function YTAuthLogout(req: Request, res: Response) {
    const clusters = getClustersFromConfig();

    const {domain} = makeAuthCookieOptions(req);

    res.setHeader('set-cookie', [
        replaceDomainIfDefined(`${YT_CYPRESS_COOKIE_NAME}=deleted; Path=/; Max-Age=0;`, domain),
        ...Object.keys(clusters).map((cluster) =>
            replaceDomainIfDefined(
                `${makeAuthClusterCookieName(cluster)}=deleted; Path=/; Max-Age=0;`,
                domain,
            ),
        ),
    ]);
}

function replaceDomainIfDefined(item: string, domain?: string) {
    if (domain) {
        return replaceDomainForSetCookie(item, domain);
    }

    return item;
}
