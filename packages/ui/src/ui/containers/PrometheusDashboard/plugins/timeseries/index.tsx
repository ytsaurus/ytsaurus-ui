import React from 'react';
import axios from 'axios';

import {Flex} from '@gravity-ui/uikit';

import {YTError} from '../../../../../@types/types';

import {formatByPramsQuotedEnv} from '../../../../utils/format';
import {IntersectionObserverContainer} from '../../../../components/IntersectionObserverContainer/IntersectionObserverContainer';
import {TimeseriesTarget} from '../../../../containers/PrometheusDashboard/PrometheusDashboard';
import YagrChartKit, {YagrWidgetData} from '../../../../components/YagrChartKit/YagrChartKit';
import {InlineError} from '../../../../components/InlineError/InlineError';
import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';
import Loader from '../../../../components/Loader/Loader';

import {PrometheusPlugins} from '../../PrometheusDashKit';

export const renderPluginTimeseries: PrometheusPlugins['timeseries']['renderer'] = (
    props,
    elementRef,
) => {
    return (
        <IntersectionObserverContainer ref={elementRef}>
            <PrometheusChart {...props} />
        </IntersectionObserverContainer>
    );
};

type TimeseriesParameters = Parameters<PrometheusPlugins['timeseries']['renderer']>;
type Props = TimeseriesParameters[0];
type PrometheusChartProps = Props;

function PrometheusChart({data}: PrometheusChartProps) {
    const {title, targets, params} = data;

    const {error, data: chartData, loading} = useLoadQueriesData(targets, params);

    return (
        <Flex direction="column">
            {title}
            {error && <InlineError error={error} />}
            {!chartData && loading && <Loader visible centered />}
            {chartData && <YagrChartKit type="yagr" data={chartData} />}
        </Flex>
    );
}

function useLoadQueriesData(
    targets: Array<TimeseriesTarget>,
    params: Record<string, {toString(): string}>,
) {
    const [cancelHelper] = React.useState(new CancelHelper());
    const [chartData, setChartData] = React.useState<{
        data?: YagrWidgetData;
        error?: YTError;
        loading?: boolean;
    }>({});

    React.useEffect(() => {
        cancelHelper.removeAllRequests();
        setChartData({loading: true});
        /**
         * Temporary solution without storing results in store
         * TODO: use rtk-query later
         */
        const promises = targets.map((item) => {
            const end = Date.now() / 1000;
            const start = end - 3600;
            const step = Math.max(1, Math.floor((end - start) / 250));
            const query = formatByPramsQuotedEnv(item.expr, params);
            return axios
                .get<QueryRangeResponse>('/api/prometheus/query_range', {
                    params: {query, start, end, step},
                    cancelToken: cancelHelper.generateNextToken(),
                })
                .then(({data}) => data);
        });

        Promise.all(promises)
            .then((results) => {
                setChartData({data: makeYagrWidgetData(targets, results), loading: false});
            })
            .catch((error) => {
                setChartData({error: isCancelled(error) ? undefined : error, loading: false});
            });
    }, [targets, params, cancelHelper]);

    return chartData;
}

function makeYagrWidgetData(
    targets: Array<TimeseriesTarget>,
    results: Array<QueryRangeResponse>,
): YagrWidgetData {
    //const res: YagrWidgetData = {};
    console.log({targets, results});
    // @ts-expect-error
    return {targets, results};
}

type QueryRangeResponse = {
    status: 'success';
    data: {
        resultType: 'matrix';
        result: Array<MetricValues>;
    };
};

type MetricValues = {
    metric: Record<string, string>;
    values: Array<[number, `${number}`]>;
    legendFormat?: string;
};
