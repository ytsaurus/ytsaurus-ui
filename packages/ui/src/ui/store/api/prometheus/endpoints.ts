import axios, {AxiosResponse} from 'axios';

import type {
    ChartDataResponse,
    PluginRendererDataParams,
    PrometheusDashboardType,
    QueryRangePostData,
} from '../../../../shared/prometheus/types';

export type PrometheusChartParams = {
    cluster: string;
    dashboardType: PrometheusDashboardType;
    id: string;

    from?: number;
    to?: number;
    pointCount?: number;

    params: PluginRendererDataParams;
};

export function fetchPrometheusChartData(args: PrometheusChartParams) {
    const {cluster, id, from, to, pointCount, ...rest} = args;
    try {
        if (from === undefined || isNaN(from) || to === undefined || isNaN(to) || !pointCount) {
            return {data: undefined, error: undefined};
        }

        const end = to / 1000;
        const start = from / 1000;
        const step = Math.max(1, Math.floor((end - start) / Math.max(10, pointCount)));

        const rangeParams = {start, end, step};

        return axios
            .post<
                ChartDataResponse,
                AxiosResponse<ChartDataResponse>,
                QueryRangePostData
            >(`/api/${cluster}/prometheus/chart-data`, {id, start, end, step, ...rest}, {params: {id}})
            .then(
                ({data}) => {
                    return {data: {responseData: data, ...rangeParams}, error: undefined};
                },
                (error: any) => {
                    return {error};
                },
            );
    } catch (error) {
        return {error};
    }
}
