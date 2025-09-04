import axios from 'axios';
import type {Request, Response} from 'express';

import {parseXYFromPanelId, replaceExprParams} from '../../shared/prometheus/utils';
import {QueryRangePostData} from '../../shared/prometheus/types';

import {
    ErrorWithCode,
    UNEXPECTED_PIPE_AXIOS_RESPONSE,
    pipeAxiosResponse,
    sendAndLogError,
} from '../utils';
import {getPreloadedPrometheusDashboard} from '../components/prometheus-dashboards';

export async function prometheusQueryRange(req: Request, res: Response) {
    const BASE_URL = req.ctx.config.prometheusBaseUrl;

    try {
        const {ytAuthCluster: cluster} = req.params;

        const {id} = req.query;
        const {x, y} = parseXYFromPanelId(typeof id === 'string' ? (id as any) : '');
        if (isNaN(x) || isNaN(y)) {
            throw new ErrorWithCode(400, 'Failed to parse x,y from id query parameter', {id});
        }

        const {dashboardType, start, end, step, targetIndex, params} =
            req.body as QueryRangePostData;

        const {panels} = await getPreloadedPrometheusDashboard({
            cluster,
            dashboardType,
        });

        const panel = panels.find((item) => {
            return item.gridPos.x === x && item.gridPos.y === y;
        });
        if (!panel || panel.type !== 'timeseries' || !panel.targets[targetIndex]) {
            throw new ErrorWithCode(400, `Failed to find a corresponding panel`, {
                cluster,
                dashboardType,
                x,
                y,
                targetIndex,
            });
        }

        const {targets} = panel;

        const query = await replaceExprParams(targets[targetIndex].expr, params, step);

        await axios
            .get(`${BASE_URL}/api/v1/query_range?`, {
                params: {query, start, end, step},
                responseType: 'stream',
            })
            .then(async (response) => {
                const pipedSize = await pipeAxiosResponse(req.ctx, res, response);
                if (!pipedSize) {
                    throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
                }
            });
    } catch (e: any) {
        sendAndLogError(req.ctx, res, null, e);
    }
}
