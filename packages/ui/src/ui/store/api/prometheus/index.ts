import {rootApi} from '..';

import {fetchPrometheusChartData} from './endpoints';

export const prometheusApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        prometheusFetch: build.query({
            queryFn: fetchPrometheusChartData,
        }),
    }),
});

export const {usePrometheusFetchQuery} = prometheusApi;
