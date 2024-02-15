import {AppConfig} from '@gravity-ui/nodekit';
import type {Response} from 'express';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {getClustersFromConfig} from './utils';

export function isYtAuthEnabled(config: AppConfig) {
    return Boolean(config.allowPasswordAuth);
}

export function YTAuthLogout(res: Response) {
    const clusters = getClustersFromConfig();

    res.setHeader(
        'set-cookie',
        [`${YT_CYPRESS_COOKIE_NAME}=deleted; Path=/; Max-Age=0;`].concat(
            Object.keys(clusters).map(
                (cluster) => `${cluster}:${YT_CYPRESS_COOKIE_NAME}=deleted; Path=/; Max-Age=0;`,
            ),
        ),
    );
}
