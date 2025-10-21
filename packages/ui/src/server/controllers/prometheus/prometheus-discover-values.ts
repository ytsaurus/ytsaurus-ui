import axios, {isAxiosError} from 'axios';
import type {Request, Response} from 'express';
import uniqWith_ from 'lodash/uniqWith';
import isEqual_ from 'lodash/isEqual';

import {makeDiscoverValuesKey, replaceExprParams} from '../../../shared/prometheus/utils';
import {
    DiscoverValuesPostData,
    DiscoverValuesResponse,
    TemplatingListItem,
} from '../../../shared/prometheus/types';

import {sendAndLogError} from '../../utils';
import {fetchDashbaordDetails} from './prometheus.utils';

export async function prometheusDiscoverValues(req: Request, res: Response) {
    const BASE_URL = req.ctx.config.prometheusBaseUrl;

    try {
        const {ytAuthCluster} = req.params;
        const {dashboardType, params: rawParmas = {}} = req.body as DiscoverValuesPostData;

        const {templating, chartParams} = await fetchDashbaordDetails(req, {
            cluster: ytAuthCluster,
            dashboardType,
            params: rawParmas,
        });

        const results: DiscoverValuesResponse['results'] = await req.ctx.call(
            'Fetch prometheus label values',
            () => {
                const queries = getDiscoverValuesParams(templating.list, chartParams, NaN);

                return Promise.all([
                    ...queries.map((item) => {
                        const {label, expr} = item;
                        const key = makeDiscoverValuesKey(item.item);
                        return axios
                            .get<{
                                status: 'success';
                                data: Array<string>;
                            }>(
                                `${BASE_URL}/api/v1/label/${encodeURIComponent(label)}/values?match[]=${encodeURIComponent(expr)}`,
                            )
                            .then(({data}) => {
                                return {key, expr, result: data};
                            })
                            .catch((e) => {
                                return {
                                    key,
                                    expr,
                                    result: {
                                        status: 'error' as const,
                                        error: isAxiosError(e) ? e.response?.data : e,
                                    },
                                };
                            });
                    }),
                ]).finally(() => {
                    res.appendHeader(
                        'X-UI-Prometheus-Params',
                        queries.map((item) => JSON.stringify(item)),
                    );
                });
            },
        );

        res.send({results});
    } catch (e: any) {
        sendAndLogError(req.ctx, res, null, e);
    }
}

function getDiscoverValuesParams(
    list: Array<TemplatingListItem>,
    chartParams: Record<string, string | number>,
    step: number,
) {
    const toDiscover = uniqWith_(
        list.reduce(
            (acc, {discover_values}) => {
                if (discover_values) {
                    acc.push(discover_values);
                }
                return acc;
            },
            [] as Array<Exclude<(typeof list)[number]['discover_values'], undefined>>,
        ),
        isEqual_,
    );

    return toDiscover.map((item) => {
        const {label, match} = item;
        const expr = replaceExprParams(`${match}`, chartParams, step);
        return {label, item, step, expr};
    });
}
