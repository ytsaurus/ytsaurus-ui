import React from 'react';
import axios, {AxiosResponse} from 'axios';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

import {YTError} from '../../../../../@types/types';

import format from '../../../../common/hammer/format';
import {YT} from '../../../../config/yt-config';

import {IntersectionObserverContainer} from '../../../../components/IntersectionObserverContainer/IntersectionObserverContainer';

import {YTChartKitLazy, getSerieColor} from '../../../../components/YTChartKit';
import {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {InlineError} from '../../../../components/InlineError/InlineError';
import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';
import Loader from '../../../../components/Loader/Loader';
import {useElementSize} from '../../../../hooks/useResizeObserver';

import {PrometheusPlugins} from '../../PrometheusDashKit';
import {PrometheusWidgetToolbar} from '../../PrometheusWidgetToolbar/PrometheusWidgetToolbar';
import {usePrometheusDashboardContext} from '../../PrometheusDashboardContext/PrometheusDashboardContext';
import {
    ChartDataResponse,
    QueryRangeData,
    QueryRangePostData,
    TimeseriesTarget,
} from '../../../../../shared/prometheus/types';

import './timeseries.scss';
import {KEY_WITH_DOUBLE_CURLY_BRACES, formatByParams} from '../../../../../shared/utils/format';

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

    const {error, data: chartData, loading} = useLoadQueriesData({id, data, pointCount, from, to});

    return (
        <React.Fragment>
            <Flex ref={setElement} className={block('widget')} direction="column" id={id}>
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
    id,
    data: {title, targets, params},
    pointCount,
    from,
    to,
}: Pick<PrometheusChartProps, 'data' | 'id'> & {pointCount?: number; from?: number; to?: number}) {
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

        const {__ytDashboardType: dashboardType} = params;

        /**
         * Temporary solution without storing results in store
         * TODO: use rtk-query later
         */
        axios
            .post<
                ChartDataResponse,
                AxiosResponse<ChartDataResponse>,
                QueryRangePostData
            >(`/api/${YT.cluster}/prometheus/chart-data`, {dashboardType, id, start, end, step, params}, {cancelToken: cancelHelper.generateNextToken(), params: {id}})
            .then(
                ({data}) => {
                    const {results} = data;
                    setChartData({
                        data: makeYagrWidgetData(
                            title,
                            targets,
                            results,
                            {end, start, step},
                            params,
                        ),
                        loading: false,
                    });
                },
                (error) => {
                    setChartData({error: isCancelled(error) ? undefined : error, loading: false});
                },
            );
    }, [id, targets, params, cancelHelper, title, pointCount, from, to]);

    return chartData;
}

function makeYagrWidgetData(
    title: string,
    targets: Array<TimeseriesTarget>,
    results: Array<QueryRangeData>,
    {end, start, step}: {end: number; start: number; step: number},
    params: Record<string, string | number>,
): YagrWidgetData {
    const res: YagrWidgetData = {
        data: {graphs: [], timeline: []},
        libraryConfig: {
            title: {text: title},
            legend: {show: true},
            tooltip: {
                title: {
                    y: ({x}) => {
                        return format.DateTime(x / 1000);
                    },
                },
            },
        },
    };

    for (let t = start; t - step * 0.5 < end; t += step) {
        res.data.timeline.push(t * 1000);
    }

    const {timeline} = res.data;

    for (let serie = 0; serie < results?.length; ++serie) {
        const {legendFormat} = targets[serie];
        for (let serie_i = 0; serie_i < (results[serie]?.data?.result?.length ?? 0); ++serie_i) {
            const serie_i_data = results[serie]?.data?.result[serie_i];
            if (!serie_i_data) {
                continue;
            }

            const {values = [], metric} = serie_i_data;

            const graph: (typeof res)['data']['graphs'][number] = {
                name: legendFormat?.length
                    ? formatByParams(
                          legendFormat,
                          {...params, ...metric},
                          KEY_WITH_DOUBLE_CURLY_BRACES,
                      )
                    : genSerieName(metric),
                data: new Array(timeline.length),
                formatter: format.Number,
                color: getSerieColor(res.data.graphs.length),
            };
            res.data.graphs.push(graph);

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
    }
    return res;
}

function genSerieName(obj: Record<string, unknown>) {
    if (!obj) {
        return undefined;
    }
    return Object.keys(obj).reduce((acc, key) => {
        return acc + `${key}:${obj[key]}; `;
    }, '');
}
