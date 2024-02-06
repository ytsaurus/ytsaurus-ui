import {AppConfig} from '@gravity-ui/nodekit';
import type {Response} from 'express';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';

export function isYtAuthEnabled(config: AppConfig) {
    return Boolean(config.allowPasswordAuth);
}

export function YTAuthLogout(res: Response, ytAuthCluster: string) {
    res.setHeader(
        'set-cookie',
        `${ytAuthCluster}:${YT_CYPRESS_COOKIE_NAME}=deleted; Path=/; Max-Age=0;`,
    );
    res.setHeader('set-cookie', `${YT_CYPRESS_COOKIE_NAME}=deleted; Path=/; Max-Age=0;`);
}
