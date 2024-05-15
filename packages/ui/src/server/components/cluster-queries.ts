import axios, {AxiosError} from 'axios';
import _ from 'lodash';
import * as os from 'os';

import type {Request} from 'express';

import {ClusterConfig} from '../../shared/yt-types';
import {YTApiUserSetup, getUserYTApiSetup, getYTApiClusterSetup} from './requestsSetup';

const REQUEST_TIMEOUT = 15000;

function getExtra(error: AxiosError) {
    const {headers} = error?.request?._options || {};
    if (headers) {
        const correlationId = headers['X-YT-Correlation-Id'];
        return correlationId && {'X-YT-Correlation-Id': correlationId};
    }
    return undefined;
}

export async function getXSRFToken(req: Request, config: YTApiUserSetup, actionPrefix = '') {
    const timeStart = Date.now();
    const {setup, proxyBaseUrl, authHeaders} = config;

    const xYTCorrelationId = `${req.id}.getXSRFToken`;

    function sendStats(responseStatus: number) {
        const timestamp = Date.now();
        req.ctx.log('getXSRFToken', {
            xYTCorrelationId,
            responseStatus,
        });

        req.ctx.stats?.('ytRequests', {
            responseStatus,
            headerContentLength: 0,
            timestamp,
            host: os.hostname(),
            service: setup.id,
            requestTime: timestamp - timeStart,
            requestId: req.id,
            action: `${actionPrefix}.getXSRFToken`,
            referer: req?.headers?.referer || '',
            page: '',
        });
    }

    return axios
        .request<{login: string; csrf_token: string}>({
            url: proxyBaseUrl + '/auth/whoami',
            method: 'GET',
            headers: {
                ...authHeaders,
                'X-YT-Correlation-Id': xYTCorrelationId,
            },
            timeout: REQUEST_TIMEOUT,
        })
        .then((response) => {
            sendStats(response.status);
            return response.data;
        })
        .catch((e) => {
            sendStats(e?.response?.status ?? 500);
            return Promise.reject(e);
        });
}

async function getVersion({proxyBaseUrl}: {proxyBaseUrl: string}) {
    return axios
        .request({
            url: proxyBaseUrl + '/version',
            method: 'GET',
            timeout: 5000,
            responseType: 'text',
        })
        .then((response) => response.data);
}

function parseVersion(version: string) {
    const match = version && version.match(/(\d+)\.(\d+)\.(\d+)/);
    return match && match[0];
}

export function getVersions(req: Request, clusters: Record<string, ClusterConfig>) {
    return Promise.all(
        _.map(clusters, (clusterConfig) => {
            const {id} = clusterConfig;
            return getVersion(getYTApiClusterSetup(id))
                .then((version) => ({id, version: parseVersion(version)}))
                .catch((error) => {
                    req.ctx.logError('getVersion error', error, getExtra(error));
                    return {id};
                });
        }),
    );
}

function prepareError(message: string, err: AxiosError) {
    let error;
    let http_status_code;
    try {
        if (err?.isAxiosError) {
            error = err.response?.data;
            http_status_code = err.response?.status;
        } else {
            error = err;
        }
    } catch {
        error = err;
    }
    return {
        message: `${message}:${_.toString(err)}`,
        code: http_status_code,
        inner_errors: _.compact([error]),
    };
}

export async function getClusterInfo(req: Request, cluster: string) {
    const config = getUserYTApiSetup(cluster, req);

    let tokenError, versionError;
    let token, version;

    const [tokenResult, versionResult] = await Promise.allSettled([
        getXSRFToken(req, config, 'ui_clusterInfo'),
        getVersion(config),
    ]);

    if (versionResult.status === 'fulfilled') {
        version = versionResult.value;
    } else {
        const err = versionResult.reason;
        versionError = prepareError('Failed to get cluster version ', err);
        req.ctx.logError('Failed to get cluster version: ' + err.toString(), err, getExtra(err));
    }

    if (tokenResult.status === 'fulfilled') {
        token = tokenResult.value;
    } else {
        const err = tokenResult.reason;
        tokenError = prepareError('Failed to get XSRF token ', err);
        req.ctx.logError('Failed to get XSRF token', err, getExtra(err));
    }

    return {
        token,
        version,
        tokenError,
        versionError,
    };
}
