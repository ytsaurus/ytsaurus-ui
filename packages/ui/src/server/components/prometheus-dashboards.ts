import os from 'os';
import {AxiosError} from 'axios';

import {PROMETHEUS_DASHBOARD_TYPES} from '../../shared/prometheus/dashboard-type';
import {DashboardInfo, PrometheusDashboardType} from '../../shared/prometheus/types';
import {getDashboardPath} from '../../shared/prometheus/utils';

import {getApp} from '../ServerFactory';
import {ErrorWithCode} from '../utils';
import {createAutoUpdatedCache} from '../utils/auto-updated-cache';

import {getRobotYTApiSetup} from './requestsSetup';

const yt = require('@ytsaurus/javascript-wrapper')();

type DashboardTypeColonCluster = `${PrometheusDashboardType}:${string}`;

function fetchPrometheusDashboard(key: DashboardTypeColonCluster) {
    return getApp().nodekit.ctx.call('fetchPrometheusDashboard', async (cx) => {
        const colonPos = key.indexOf(':');
        const dashboardType = key.substring(0, colonPos) as PrometheusDashboardType;
        const cluster = key.substring(colonPos + 1);

        if (colonPos === -1 || !cluster || !dashboardType) {
            throw new ErrorWithCode(400, {message: `Unexpected key value`, attributes: {key}});
        }

        if (!cx.get('requestId')) {
            const requestId = crypto.randomUUID();
            cx.set('requestId', requestId);
            cx.setTag('request_id', requestId);
        }

        const timeStart = Date.now();
        const {setup: configSetup} = getRobotYTApiSetup(cluster);
        const xYTCorrelationId = `${cx.get('requestId')}.fetchPrometheusDashboard`;

        function sendStats(responseStatus: number) {
            const timestamp = Date.now();
            cx.log('fetchClusterParams', {xYTCorrelationId, responseStatus});
            cx.stats?.('ytRequests', {
                responseStatus,
                headerContentLength: 0,
                timestamp,
                host: os.hostname(),
                service: cluster,
                requestTime: timestamp - timeStart,
                requestId: cx.get('requestId')!,
                action: 'fetchPrometheusDashboard',
            });
        }

        return (
            yt.v3.get({
                setup: configSetup,
                parameters: {path: getDashboardPath(dashboardType)},
            }) as Promise<DashboardInfo>
        ).then(
            (res) => {
                sendStats(200);
                return res;
            },
            (error) => {
                const statusCode = (error as AxiosError).status ?? -500;
                sendStats(statusCode);
                return Promise.reject(error);
            },
        );
    });
}

const getCached = createAutoUpdatedCache(fetchPrometheusDashboard);

export function getPreloadedPrometheusDashboard({
    cluster,
    dashboardType = null,
}: {
    cluster: string;
    dashboardType: PrometheusDashboardType | null;
}) {
    if (!dashboardType || !PROMETHEUS_DASHBOARD_TYPES.find((i) => i === dashboardType)) {
        throw new ErrorWithCode(400, {
            message: `Unexpected value of dashboardType`,
            attributes: {dashboardType},
        });
    }

    return getCached(`${dashboardType}:${cluster}`);
}
