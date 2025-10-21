import {rootApi} from '..';

import {fetchPrometheusChartData, fetchPrometheusDiscoverValues} from './endpoints';

export const prometheusApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        prometheusFetch: build.query({
            queryFn: fetchPrometheusChartData,
        }),
        prometheusDiscoverValues: build.query({
            queryFn: fetchPrometheusDiscoverValues,
        }),
    }),
});

export const {usePrometheusFetchQuery, usePrometheusDiscoverValuesQuery} = prometheusApi;
