import crypto from 'crypto';
import * as os from 'os';
import type {AppContext} from '@gravity-ui/nodekit';
// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';

import {createAutoUpdatedCache} from '../utils/auto-updated-cache';
import {getRobotYTApiSetup} from './requestsSetup';
import {getApp} from '../ServerFactory';
import {FIX_MY_TYPE} from '../../@types/types';
import {USE_SUPRESS_SYNC} from '../../shared/constants';
import {ClusterUiConfig} from '../../shared/yt-types';

const yt = ytLib();

class BatchSubrequestError extends Error {
    response: Awaited<ReturnType<typeof fetchClusterParams>>;

    constructor(response: Awaited<ReturnType<typeof fetchClusterParams>>) {
        super();

        this.response = response;
    }
}

function fetchClusterParams(cluster: string, {ctx}: {ctx?: AppContext}) {
    const app = getApp();
    return (ctx ?? app.nodekit.ctx).call('fetchClusterParams', async (cx) => {
        if (!cx.get('requestId')) {
            const requestId = crypto.randomUUID();
            cx.set('requestId', requestId);
            cx.setTag('request_id', requestId);
        }

        const timeStart = Date.now();
        const {setup: configSetup} = getRobotYTApiSetup(cluster);
        const xYTCorrelationId = `${cx.get('requestId')}.fetchClusterParams`;

        const mlSuffix = '.masterList';

        function sendStats(responseStatus: number, suffix = '') {
            const timestamp = Date.now();
            cx.log('fetchClusterParams' + suffix, {
                xYTCorrelationId: xYTCorrelationId + suffix,
                responseStatus,
            });
            cx.stats?.('ytRequests', {
                responseStatus,
                headerContentLength: 0,
                timestamp,
                host: os.hostname(),
                service: cluster,
                requestTime: timestamp - timeStart,
                requestId: cx.get('requestId')! + suffix,
                action: 'fetchClusterParams' + suffix,
            });
        }

        const mastersList = await yt.v3
            .executeBatch({
                setup: {
                    ...configSetup,
                    requestHeaders: {
                        ...cx.getMetadata(),
                        'X-YT-Correlation-Id': xYTCorrelationId + mlSuffix,
                    },
                    transformResponse({parsedData, rawResponse}: FIX_MY_TYPE) {
                        return {
                            data: parsedData,
                            status: rawResponse?.status,
                            headers: rawResponse?.headers,
                        };
                    },
                    transformError({parsedData, rawError}: FIX_MY_TYPE) {
                        throw {
                            data: parsedData,
                            status: rawError?.response?.status,
                            headers: rawError?.response?.headers,
                        };
                    },
                },
                parameters: {
                    requests: [
                        {
                            command: 'list',
                            parameters: {
                                path: '//sys/primary_masters',
                                ...USE_SUPRESS_SYNC,
                            },
                        },
                    ],
                },
            })
            .then((response: FIX_MY_TYPE) => {
                cx.log('List of masters is fetched', {
                    cluster,
                    'x-yt-proxy': response.headers['x-yt-proxy'],
                    'x-yt-request-id': response.headers['x-yt-request-id'],
                    'x-yt-trace-id': response.headers['x-yt-trace-id'],
                });
                sendStats(response.status, mlSuffix);
                return response.data[0];
            })
            .catch((error: FIX_MY_TYPE) => {
                const headers = error?.headers || {};
                cx.logError('List of masters fetch failed', {
                    cluster,
                    'x-yt-proxy': headers['x-yt-proxy'],
                    'x-yt-request-id': headers['x-yt-request-id'],
                    'x-yt-trace-id': headers['x-yt-trace-id'],
                });
                sendStats(error.status, mlSuffix);
                return Promise.reject(error.data);
            });

        const [mediumList, schedulerVersion, uiConfig, uiDevConfig, masterVersion] = await yt.v3
            .executeBatch({
                setup: {
                    ...configSetup,
                    requestHeaders: {...cx.getMetadata(), 'X-YT-Correlation-Id': xYTCorrelationId},
                    transformResponse({parsedData, rawResponse}: FIX_MY_TYPE) {
                        return {
                            data: parsedData,
                            status: rawResponse?.status,
                            headers: rawResponse?.headers,
                        };
                    },
                    transformError({parsedData, rawError}: FIX_MY_TYPE) {
                        throw {
                            data: parsedData,
                            status: rawError?.response?.status,
                            headers: rawError?.response?.headers,
                        };
                    },
                },
                parameters: {
                    requests: [
                        {
                            command: 'list',
                            parameters: {
                                path: '//sys/media',
                                ...USE_SUPRESS_SYNC,
                            },
                        },
                        {
                            command: 'get',
                            parameters: {
                                path: '//sys/scheduler/orchid/service/version',
                                ...USE_SUPRESS_SYNC,
                            },
                        },
                        {
                            command: 'get',
                            parameters: {
                                path: '//sys/@ui_config',
                                ...USE_SUPRESS_SYNC,
                            },
                        },
                        {
                            command: 'get',
                            parameters: {
                                path: '//sys/@ui_config_dev_overrides',
                                ...USE_SUPRESS_SYNC,
                            },
                        },
                        ...(!mastersList.output?.length
                            ? []
                            : [
                                  {
                                      command: 'get',
                                      parameters: {
                                          path: `//sys/primary_masters/${mastersList.output[0]}/orchid/service/version`,
                                          ...USE_SUPRESS_SYNC,
                                      },
                                  },
                              ]),
                    ],
                },
            })
            .then((response: FIX_MY_TYPE) => {
                cx.log('Fetched cluster config', {
                    cluster,
                    'x-yt-proxy': response.headers['x-yt-proxy'],
                    'x-yt-request-id': response.headers['x-yt-request-id'],
                    'x-yt-trace-id': response.headers['x-yt-trace-id'],
                });
                sendStats(response.status);
                return response.data;
            })
            .catch((error: FIX_MY_TYPE) => {
                const headers = error?.headers || {};
                cx.logError('Cluster config fetch failed', {
                    cluster,
                    'x-yt-proxy': headers['x-yt-proxy'],
                    'x-yt-request-id': headers['x-yt-request-id'],
                    'x-yt-trace-id': headers['x-yt-trace-id'],
                });
                sendStats(error.status);
                return Promise.reject(error.data);
            });

        if (uiDevConfig?.error?.code === yt.codes.NODE_DOES_NOT_EXIST) {
            delete uiDevConfig.error;
        }

        if (schedulerVersion?.error?.code === yt.codes.NODE_DOES_NOT_EXIST) {
            delete schedulerVersion.error;
            schedulerVersion.output = '0.0.0-unknown';
        }

        if (masterVersion?.error?.code === yt.codes.NODE_DOES_NOT_EXIST) {
            delete masterVersion.error;
            masterVersion.output = '0.0.0-unknown';
        }

        const response = {
            mediumList,
            schedulerVersion,
            uiConfig,
            uiDevConfig,
            masterVersion: masterVersion ?? mastersList,
        };

        if (
            mediumList.error ||
            schedulerVersion.error ||
            (uiConfig.error && uiConfig.error.code !== yt.codes.NODE_DOES_NOT_EXIST) ||
            (uiDevConfig.error && uiDevConfig.error.code !== yt.codes.NODE_DOES_NOT_EXIST) ||
            (masterVersion?.error && masterVersion.error.code !== yt.codes.NODE_DOES_NOT_EXIST) ||
            mastersList.error
        ) {
            cx.logError('Unacceptable response', undefined, {
                cluster,
                mediumList: {error: mediumList.error},
                schedulerVersion: {error: schedulerVersion.error},
                uiConfig: {error: uiConfig.error},
                uiDevConfig: {error: uiDevConfig.error},
                masterVersion: {error: masterVersion?.error},
                masterList: {error: mastersList?.error},
            });
            throw new BatchSubrequestError(response);
        }

        return response;
    });
}

const getCached = createAutoUpdatedCache(fetchClusterParams);

export async function getPreloadedClusterParams(cluster: string, ctx: AppContext) {
    const ctxObject: Parameters<typeof fetchClusterParams>[1] = {ctx};
    let response: Awaited<ReturnType<typeof fetchClusterParams>>;

    try {
        response = await getCached(cluster, ctxObject);
    } catch (error) {
        if (error instanceof BatchSubrequestError) {
            response = error.response;
        } else {
            throw error;
        }
    } finally {
        delete ctxObject.ctx;
    }

    return response;
}

export async function getPreloadedClusterUiConfig(
    cluster: string,
    ctx: AppContext,
    isDeveloper: boolean,
): Promise<ClusterUiConfig> {
    try {
        const {uiConfig, uiDevConfig} = await getPreloadedClusterParams(cluster, ctx);
        return {...uiConfig.output, ...(isDeveloper ? uiDevConfig.output : {})};
    } catch {
        return {};
    }
}
