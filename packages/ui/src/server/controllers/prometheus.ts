import axios, {isAxiosError} from 'axios';
import type {Request, Response} from 'express';

// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';
const yt = ytLib();

import {parseXYFromPanelId, replaceExprParams} from '../../shared/prometheus/utils';
import {
    DashboardInfo,
    PluginRendererDataParams,
    QueryRangeData,
    QueryRangePostData,
} from '../../shared/prometheus/types';
import {
    CheckPermissionResult,
    makeCheckPermissionBatchSubRequest,
} from '../../shared/utils/check-permission';

import {getPreloadedPrometheusDashboard} from '../components/prometheus-dashboards';
import {BatchResultsItem, BatchSubRequest} from '../../shared/yt-types';
import {YTError} from '../../@types/types';
import {getXSRFToken} from '../components/cluster-queries';
import {formatByParams} from '../../shared/utils/format';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {ErrorWithCode, sendAndLogError} from '../utils';

export async function prometheusQueryRange(req: Request, res: Response) {
    const BASE_URL = req.ctx.config.prometheusBaseUrl;

    const queries: Array<object> = [];

    try {
        const {ytAuthCluster} = req.params;

        const {id} = req.query;
        const {x, y} = parseXYFromPanelId(typeof id === 'string' ? (id as any) : '');
        if (isNaN(x) || isNaN(y)) {
            throw new ErrorWithCode(400, {
                message: 'Failed to parse x,y from id query parameter',
                attributes: {id},
            });
        }

        const {dashboardType, start, end, step, params: rawParmas} = req.body as QueryRangePostData;

        const {panel, templating} = await req.ctx.call('Fetch dashboard details', async () => {
            const dashboard = await getPreloadedPrometheusDashboard({
                cluster: ytAuthCluster,
                dashboardType,
            });

            const panel = dashboard.panels.find((item) => {
                return item.gridPos.x === x && item.gridPos.y === y;
            });
            if (!panel || panel.type !== 'timeseries') {
                throw new ErrorWithCode(400, {
                    message: `Failed to find details of a corresponding pannel`,
                    attributes: {
                        cluster: ytAuthCluster,
                        dashboardType,
                        x,
                        y,
                    },
                });
            }
            return {panel, templating: dashboard.templating};
        });

        const {permissions, list} = templating;

        const chartParams = list.reduce(
            (acc, {name, default_for_ui}) => {
                const value = rawParmas[name] ?? default_for_ui;
                if (value !== undefined) {
                    acc[name] = value;
                }
                return acc;
            },
            {} as typeof rawParmas,
        );

        await req.ctx.call('Check dashboard permissions', () =>
            checkDashboardPermissions(req, {
                ytAuthCluster,
                permissions,
                chartParams,
            }),
        );

        const {targets} = panel;

        const results = await req.ctx.call('Fetch prometheus data', () =>
            Promise.all(
                targets.map(({expr}) => {
                    const query = replaceExprParams(expr, chartParams, step);
                    queries.push({query, start, end, step});
                    return axios
                        .get<QueryRangeData>(`${BASE_URL}/api/v1/query_range?`, {
                            params: {query, start, end, step},
                        })
                        .then(async (response) => {
                            return response.data;
                        });
                }),
            ),
        );

        res.send({results});
    } catch (e: any) {
        if (isAxiosError(e)) {
            Object.assign(e.response?.data, {queries});
        } else {
            Object.assign(e, {queries});
        }
        sendAndLogError(req.ctx, res, null, e);
    }
}

async function checkDashboardPermissions(
    req: Request,
    {
        ytAuthCluster,
        permissions,
        chartParams,
    }: {
        ytAuthCluster: string;
        permissions?: DashboardInfo['templating']['permissions'];
        chartParams: PluginRendererDataParams;
    },
) {
    const permissionsSubRequestsByCluster = new Map<string, Array<BatchSubRequest>>();
    permissions?.forEach(
        ({cluster: rawCluster = ytAuthCluster, path: rawPath, permission, ignorePaths}) => {
            // chartParams should contain only keys corresponding to items of `templating.list` of a dashboard description
            // from //sys/interface-monitoring/*, so it is safe to use it for RegExp
            // eslint-disable-next-line security/detect-non-literal-regexp
            const keyToRegex = (key: string) => new RegExp(`\\$${key}`, 'g');

            const path = formatByParams(rawPath, chartParams, {keyToRegex});

            if (
                ignorePaths?.some((item) => {
                    const pathToIgnore = formatByParams(item, chartParams, {keyToRegex});
                    return path === pathToIgnore;
                })
            ) {
                return;
            }

            const cluster = formatByParams(rawCluster, chartParams, {keyToRegex});

            const subRequest = makeCheckPermissionBatchSubRequest({
                path,
                user: '',
                permission,
            });

            const dst = permissionsSubRequestsByCluster.get(cluster);
            if (!dst) {
                permissionsSubRequestsByCluster.set(cluster, [subRequest]);
            } else {
                dst.push(subRequest);
            }
        },
    );
    const permissionEntries = [...permissionsSubRequestsByCluster.entries()];

    const userWithSetup = await Promise.all(
        permissionEntries.map(([cluster]) => {
            const userYtApiSetup = getUserYTApiSetup(cluster, req);
            return getXSRFToken(req, userYtApiSetup).then((data) => {
                return {cluster, user: data.login, userYtApiSetup};
            });
        }),
    );

    const checkResults = await Promise.all(
        permissionEntries.map(([_cluster, requests], index) => {
            const {user, userYtApiSetup} = userWithSetup[index];
            const {setup} = userYtApiSetup;
            return yt.v3.executeBatch({
                setup,
                parameters: {
                    requests: requests.map((item) => {
                        return {
                            ...item,
                            parameters: {
                                ...item.parameters,
                                user,
                            },
                        };
                    }),
                },
            }) as Promise<Array<BatchResultsItem<CheckPermissionResult>>>;
        }),
    ).then((data) => {
        const error: YTError<{attributes?: object}> = {
            message: 'Check permissions error',
            inner_errors: [],
        };

        for (let i = 0; i < data.length; ++i) {
            const clusterResults = data[i];
            const [cluster, permissions] = permissionEntries[i];
            for (const item of clusterResults) {
                if (item.error) {
                    error.inner_errors?.push(item.error);
                } else if (item.output?.action !== 'allow') {
                    error.inner_errors?.push({
                        message: `Missing permission`,
                        attributes: {cluster, permissions} as any,
                    });
                }
            }
        }
        if (error.inner_errors?.length) {
            throw new ErrorWithCode(403, error);
        }
        return data;
    });

    return {checkResults, permissionEntries};
}
