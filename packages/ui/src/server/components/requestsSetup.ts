import type {Request} from 'express';

import {YTCoreConfig} from '../../@types/core';
import {ClusterConfig} from '../../shared/yt-types';
import {getClusterConfig} from '../components/utils';
import {getApp} from '../ServerFactory';

function getRobotOAuthToken() {
    const {ytInterfaceSecret} = getApp().config as YTCoreConfig;
    // eslint-disable-next-line security/detect-non-literal-require
    const secret = ytInterfaceSecret ? require(ytInterfaceSecret).oauthToken : '';
    return secret;
}

export interface YTApiSetup {
    id: string;
    proxy: string;
    authentication: 'none' | 'basic' | 'domain' | {type: 'oauth'; token: string};
    secure: boolean;
    useEncodedParameters: boolean;
    useHeavyProxy: boolean;
    timeout: number;
}

function getClusterSetup(clusterConfig: ClusterConfig): {
    setup: YTApiSetup;
    proxyBaseUrl: string;
} {
    const {proxy} = clusterConfig;
    const secure = Boolean(clusterConfig?.secure);

    return {
        setup: {
            id: clusterConfig?.id,
            proxy,
            authentication: clusterConfig?.authentication || 'none',
            secure,
            useEncodedParameters: true,
            useHeavyProxy: false,
            timeout: 5000,
        },
        proxyBaseUrl: secure ? `https://${proxy}` : `http://${proxy}`,
    };
}

export type YTApiClusterSetup = ReturnType<typeof getClusterSetup>;

export function getYTApiClusterSetup(
    cluster: string,
): YTApiClusterSetup & {isLocalCluster?: boolean} {
    const {
        clusterConfig,
        ytConfig: {isLocalCluster},
    } = getClusterConfig(cluster);
    if (!clusterConfig) {
        throw new Error(`Cluster '${cluster}' is not found`);
    }

    return {isLocalCluster, ...getClusterSetup(clusterConfig)};
}

export function getRobotYTApiSetup(cluster: string): YTApiUserSetup {
    const oauthToken = getRobotOAuthToken();
    const config = getYTApiClusterSetup(cluster);

    const {setup, ...rest} = config;

    const authHeaders: Record<string, string> =
        setup.authentication && setup.authentication !== 'none'
            ? {
                  Authorization: `OAuth ${oauthToken}`,
              }
            : {};

    return {
        setup: {
            ...setup,
            authentication:
                setup.authentication && setup.authentication !== 'none'
                    ? {
                          type: 'oauth',
                          token: oauthToken!,
                      }
                    : 'none',
        },
        authHeaders,
        ...rest,
    };
}

/**
 * @param cluster
 * @param req
 * @returns undefined when cluster is not found
 */
export function getUserYTApiSetup(cluster: string, req: Request): YTApiUserSetup {
    const {setup, ...rest} = getYTApiClusterSetup(cluster);
    const {authentication} = setup;

    const authHeaders =
        authentication && authentication !== 'none' ? req.yt.ytApiAuthHeaders || {} : {};

    Object.assign(setup, {requestHeaders: {...authHeaders}});

    return {
        ...rest,
        setup,
        authHeaders,
    };
}

export type YTApiUserSetup = ReturnType<typeof getYTApiClusterSetup> & {
    authHeaders: Record<string, string>;
};
