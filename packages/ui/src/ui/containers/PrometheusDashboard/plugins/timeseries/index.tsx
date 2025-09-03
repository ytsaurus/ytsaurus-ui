import React from 'react';
import axios from 'axios';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

import {YTError} from '../../../../../@types/types';

import format from '../../../../common/hammer/format';
import {formatByPramsQuotedEnv} from '../../../../utils/format';
import {IntersectionObserverContainer} from '../../../../components/IntersectionObserverContainer/IntersectionObserverContainer';

import {YTChartKitLazy, getSerieColor} from '../../../../components/YTChartKit';
import {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {InlineError} from '../../../../components/InlineError/InlineError';
import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';
import Loader from '../../../../components/Loader/Loader';
import {humanizeInterval} from '../../../../components/common/Timeline/util';
import {useElementSize} from '../../../../hooks/useResizeObserver';

import {PrometheusPlugins} from '../../PrometheusDashKit';
import {PrometheusWidgetToolbar} from '../../PrometheusWidgetToolbar/PrometheusWidgetToolbar';
import {usePrometheusDashboardContext} from '../../PrometheusDashboardContext/PrometheusDashboardContext';
import {TimeseriesTarget} from '../../../../../shared/prometheus/types';

import './timeseries.scss';

const block = cn('yt-prometheus-timeseries');

export const renderPluginTimeseries: PrometheusPlugins['timeseries']['renderer'] = (
    props,
    elementRef,
) => {
    return <ExpandablePrometheusChart {...props} elementRef={elementRef} />;
};

function ExpandablePrometheusChart({
    elementRef,
    ...props
}: PrometheusChartProps & {elementRef: React.Ref<any>}) {
    const {
        expandedId,
        timeRangeFilter: {from, to},
    } = usePrometheusDashboardContext();

    return (
        <IntersectionObserverContainer
            key={props.id}
            className={block({expanded: props.id === expandedId})}
            ref={elementRef}
        >
            <PrometheusChart {...props} from={from} to={to} />
        </IntersectionObserverContainer>
    );
}

type TimeseriesParameters = Parameters<PrometheusPlugins['timeseries']['renderer']>;
type Props = TimeseriesParameters[0];
type PrometheusChartProps = Props;

function PrometheusChart({
    data,
    id,
    from,
    to,
}: PrometheusChartProps & {from?: number; to?: number}) {
    const {title} = data;
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);

    const pointCount = useElementSize({element: element as Element})?.contentRect.width;

    const {error, data: chartData, loading} = useLoadQueriesData({data, pointCount, from, to});

    return (
        <React.Fragment>
            <Flex ref={setElement} className={block('widget')} direction="column">
                {chartData ? (
                    <YTChartKitLazy type="yagr" data={chartData} />
                ) : (
                    <>
                        <div className={block('widget-title')}>{title}</div>
                        {error && <InlineError error={error} />}
                        {!chartData && loading && <Loader visible centered />}
                    </>
                )}
            </Flex>
            <PrometheusWidgetToolbar id={id} />
        </React.Fragment>
    );
}

function useLoadQueriesData({
    data: {title, targets, params},
    pointCount,
    from,
    to,
}: Pick<PrometheusChartProps, 'data'> & {pointCount?: number; from?: number; to?: number}) {
    const [cancelHelper] = React.useState(new CancelHelper());
    const [chartData, setChartData] = React.useState<{
        data?: YagrWidgetData;
        error?: YTError;
        loading?: boolean;
    }>({});

    React.useEffect(() => {
        if (!pointCount || from === undefined || to === undefined) {
            return;
        }

        cancelHelper.removeAllRequests();
        setChartData({loading: true});

        const end = to / 1000;
        const start = from / 1000;
        const step = Math.max(1, Math.floor((end - start) / Math.max(10, pointCount)));

        /**
         * Temporary solution without storing results in store
         * TODO: use rtk-query later
         */
        const promises = targets.map((item) => {
            const query = replaceExprParams(item.expr, params, step);
            return axios
                .get<QueryRangeResponse>('/api/prometheus/query_range', {
                    params: {query, start, end, step},
                    cancelToken: cancelHelper.generateNextToken(),
                })
                .then(({data}) => data);
        });

        Promise.all(promises)
            .then((results) => {
                setChartData({
                    data: makeYagrWidgetData(title, targets, results, {end, start, step}),
                    loading: false,
                });
            })
            .catch((error) => {
                setChartData({error: isCancelled(error) ? undefined : error, loading: false});
            });
    }, [targets, params, cancelHelper, title, pointCount, from, to]);

    return chartData;
}

const SPECIAL_EXPR_ENV = {
    $__rate_interval: calculateRateInterval,
};

/**
 * Poor implementation of
 * https://github.com/grafana/grafana/blob/192d3783d5bede8362c1eed0c27422f431478b5a/pkg/promlib/models/query.go#L345-L366
 */
function calculateRateInterval(stepSec: number) {
    const minStep = 15000;
    return humanizeInterval(0, Math.max(stepSec * 1000 + minStep, minStep * 4));
}

function replaceExprParams(
    expr: string,
    params: Record<string, {toString(): string}>,
    stepSec: number,
) {
    let res = formatByPramsQuotedEnv(expr, params);
    for (const k of Object.keys(SPECIAL_EXPR_ENV)) {
        const key = k as keyof typeof SPECIAL_EXPR_ENV;
        if (res.indexOf(key)) {
            res = res.replace(key, SPECIAL_EXPR_ENV[key](stepSec));
        }
    }
    return res;
}

function makeYagrWidgetData(
    title: string,
    targets: Array<TimeseriesTarget>,
    results: Array<QueryRangeResponse>,
    {end, start, step}: {end: number; start: number; step: number},
): YagrWidgetData {
    const res: YagrWidgetData = {
        data: {graphs: [], timeline: []},
        libraryConfig: {
            title: {text: title},
            legend: {show: true},
        },
    };

    for (let t = start; t - step * 0.5 < end; t += step) {
        res.data.timeline.push(t * 1000);
    }

    const {timeline} = res.data;

    for (let serie = 0; serie < results?.length; ++serie) {
        const graph: (typeof res)['data']['graphs'][number] = {
            name: format.ReadableField(targets[serie].legendFormat),
            data: new Array(timeline.length),
            formatter: format.Number,
            color: getSerieColor(serie),
        };
        res.data.graphs.push(graph);

        const {values = []} = results[serie]?.data?.result?.[0] ?? {};

        if (!values.length) {
            continue;
        }

        let i = 0;
        for (; i < values.length; ++i) {
            const [t, valueStr] = values[i];
            const pos = Math.round((t - start) / step);
            graph.data[pos] = Number(valueStr);
        }

        if (i === 0) {
            res.data.graphs.pop();
        }
    }
    return res;
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
