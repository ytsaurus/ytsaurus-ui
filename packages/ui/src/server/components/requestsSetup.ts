import type {Request} from 'express';

import {YTCoreConfig} from '../../@types/core';
import {ClusterConfig} from '../../shared/yt-types';
import {getClusterConfig} from '../components/utils';
import {getApp} from '../ServerFactory';

function getRobotSecret(cluster: string, type: 'oauthToken' | 'prometheusAuthorizationHeader') {
    const {ytInterfaceSecret} = getApp().config as YTCoreConfig;

    let res = '';

    if (ytInterfaceSecret) {
        res =
            // eslint-disable-next-line security/detect-non-literal-require
            require(ytInterfaceSecret)?.[cluster]?.[type] ||
            // eslint-disable-next-line security/detect-non-literal-require
            require(ytInterfaceSecret)?.[type]; // Backward compatibility
    }

    return res || process.env.YT_TOKEN;
}

function getRobotOAuthToken(cluster: string) {
    return getRobotSecret(cluster, 'oauthToken');
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
    const oauthToken = getRobotOAuthToken(cluster);
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

export function getUserTabletErrorApiSetup(
    cluster: string,
    req: Request,
    testingHeaders?: boolean,
) {
    const {authentication} = getYTApiClusterSetup(cluster).setup;
    const tabletsHeaders = testingHeaders
        ? req.yt.tabletErrorTestingApiAuthHeaders
        : req.yt.tabletErrorApiAuthHeaders;

    const authHeaders =
        authentication && authentication !== 'none'
            ? tabletsHeaders || req.yt.ytApiAuthHeaders || {}
            : {};

    return {authHeaders};
}

export type YTApiUserSetup = ReturnType<typeof getYTApiClusterSetup> & {
    authHeaders: Record<string, string>;
};
