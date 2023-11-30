import {AppConfig} from '@gravity-ui/nodekit';
import type {Response} from 'express';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';

export function isYtAuthEnabled(config: AppConfig) {
    return Boolean(config.ytAuthCluster);
}

export function assertAuthEnabled(ytAuthCluster?: string): asserts ytAuthCluster is string {
    if (!ytAuthCluster) {
        throw new Error(
            'Cluster for password authentication is disabled. You have to define ytAuthCluster to use it.',
        );
    }
}

export function getAuthCluster(config: AppConfig) {
    assertAuthEnabled(config.ytAuthCluster);
    return config.ytAuthCluster;
}

export function YTAuthLogout(res: Response) {
    res.setHeader('set-cookie', `${YT_CYPRESS_COOKIE_NAME}=deleted; Path=/; Max-Age=0;`);
}
