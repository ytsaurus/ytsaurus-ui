import type {Request} from 'express';

// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';
const yt = ytLib();

import {
    DashboardInfo,
    PluginRendererDataParams,
    PrometheusDashboardType,
} from '../../../shared/prometheus/types';
import {
    CheckPermissionResult,
    makeCheckPermissionBatchSubRequest,
} from '../../../shared/utils/check-permission';

import {BatchResultsItem, BatchSubRequest} from '../../../shared/yt-types';
import {YTError} from '../../../@types/types';
import {getXSRFToken} from '../../components/cluster-queries';
import {formatByParams} from '../../../shared/utils/format';
import {getUserYTApiSetup} from '../../components/requestsSetup';
import {getPreloadedPrometheusDashboard} from '../../components/prometheus-dashboards';
import {ErrorWithCode} from '../../utils';

import {parseXYFromPanelId} from '../../../shared/prometheus/utils';

export async function fetchDashboardDetails(
    req: Request,
    {
        cluster,
        dashboardType,
        chartId,
        params,
    }: {
        cluster: string;
        dashboardType: PrometheusDashboardType;
        params: PluginRendererDataParams;
        chartId?: string;
    },
) {
    let pos: undefined | {x: number; y: number};
    if (chartId) {
        pos = parseXYFromPanelId(typeof chartId === 'string' ? (chartId as any) : '');
        if (isNaN(pos.x) || isNaN(pos.y)) {
            throw new ErrorWithCode(400, {
                message: 'Failed to parse x,y from chartId query parameter',
                attributes: {chartId},
            });
        }
    }

    const res = await req.ctx.call('Fetch dashboard details', async () => {
        const dashboard = await getPreloadedPrometheusDashboard({
            cluster,
            dashboardType,
        });

        let panel;
        if (chartId && pos) {
            const {x, y} = pos;

            panel = dashboard.panels.find((item) => {
                return item.gridPos.x === x && item.gridPos.y === y;
            });
            if (!panel || panel.type !== 'timeseries') {
                throw new ErrorWithCode(400, {
                    message: `Failed to find details of a corresponding pannel`,
                    attributes: {cluster, dashboardType, x, y},
                });
            }
        }
        return {panel, templating: dashboard.templating};
    });

    const {permissions, list} = res.templating;

    const chartParams = list.reduce(
        (acc, {name, default_for_ui}) => {
            const value = params[name] ?? default_for_ui;
            if (value !== undefined) {
                acc[name] = value;
            }
            return acc;
        },
        {} as typeof params,
    );

    await req.ctx.call('Check dashboard permissions', () =>
        checkDashboardPermissions(req, {
            ytAuthCluster: cluster,
            permissions,
            chartParams,
        }),
    );

    return Object.assign(res, {chartParams});
}

export async function checkDashboardPermissions(
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
            return getXSRFToken(req, userYtApiSetup).then(({login, csrf_token}) => {
                return {cluster, user: login, userYtApiSetup, csrf_token};
            });
        }),
    );

    const checkResults = await Promise.all(
        permissionEntries.map(([_cluster, requests], index) => {
            const {user, userYtApiSetup, csrf_token} = userWithSetup[index];
            const {setup} = userYtApiSetup;
            return yt.v3.executeBatch({
                setup: {
                    ...setup,
                    requestHeaders: {
                        ...setup.requestHeaders,
                        'X-Csrf-Token': csrf_token,
                    },
                },
                parameters: {
                    requests: requests.map((item) => {
                        Object.assign(item.parameters, {user});
                        return item;
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
