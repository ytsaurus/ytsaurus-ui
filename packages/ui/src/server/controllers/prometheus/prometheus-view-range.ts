import axios from 'axios';
import type {Request, Response} from 'express';

import {replaceExprParams} from '../../../shared/prometheus/utils';
import {QueryRangeData, QueryRangePostData} from '../../../shared/prometheus/types';

import {sendAndLogError} from '../../utils';
import {fetchDashbaordDetails} from './prometheus.utils';

export async function prometheusQueryRange(req: Request, res: Response) {
    const BASE_URL = req.ctx.config.prometheusBaseUrl;

    try {
        const {ytAuthCluster} = req.params;
        const {id} = req.query;

        const {dashboardType, start, end, step, params: rawParmas} = req.body as QueryRangePostData;

        const {panel, chartParams} = await fetchDashbaordDetails(req, {
            cluster: ytAuthCluster,
            dashboardType,
            params: rawParmas,
            chartId: id as string,
        });

        const {targets} = panel ?? {};

        const results = await req.ctx.call('Fetch prometheus data', () => {
            const queries =
                targets?.map(({expr}) => {
                    const query = replaceExprParams(expr, chartParams, step);
                    return {query, start, end, step};
                }) ?? [];

            return Promise.all(
                queries.map((params) => {
                    return axios
                        .get<QueryRangeData>(`${BASE_URL}/api/v1/query_range?`, {
                            params,
                        })
                        .then(async (response) => {
                            return response.data;
                        });
                }),
            )

                .finally(() => {
                    res.appendHeader(
                        'X-UI-Prometheus-Params',
                        queries.map((item) => JSON.stringify(item)),
                    );
                });
        });

        res.send({results});
    } catch (e: any) {
        sendAndLogError(req.ctx, res, null, e);
    }
}
