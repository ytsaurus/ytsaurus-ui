import axios from 'axios';
import type {Request, Response} from 'express';

import {parseXYFromPanelId, replaceExprParams} from '../../shared/prometheus/utils';
import {QueryRangeData, QueryRangePostData} from '../../shared/prometheus/types';

import {getPreloadedPrometheusDashboard} from '../components/prometheus-dashboards';
import {ErrorWithCode, sendAndLogError} from '../utils';

export async function prometheusQueryRange(req: Request, res: Response) {
    const BASE_URL = req.ctx.config.prometheusBaseUrl;

    try {
        const {ytAuthCluster: cluster} = req.params;

        const {id} = req.query;
        const {x, y} = parseXYFromPanelId(typeof id === 'string' ? (id as any) : '');
        if (isNaN(x) || isNaN(y)) {
            throw new ErrorWithCode(400, 'Failed to parse x,y from id query parameter', {id});
        }

        const {dashboardType, start, end, step, params} = req.body as QueryRangePostData;

        const {panels} = await getPreloadedPrometheusDashboard({
            cluster,
            dashboardType,
        });

        const panel = panels.find((item) => {
            return item.gridPos.x === x && item.gridPos.y === y;
        });
        if (!panel || panel.type !== 'timeseries') {
            throw new ErrorWithCode(400, `Failed to find a corresponding panel`, {
                cluster,
                dashboardType,
                x,
                y,
            });
        }

        const {targets} = panel;

        const results = await Promise.all(
            targets.map(({expr}) => {
                const query = replaceExprParams(expr, params, step);
                return axios
                    .get<QueryRangeData>(`${BASE_URL}/api/v1/query_range?`, {
                        params: {query, start, end, step},
                    })
                    .then(async (response) => {
                        return response.data;
                    });
            }),
        );

        res.send({results});
    } catch (e: any) {
        sendAndLogError(req.ctx, res, null, e);
    }
}
