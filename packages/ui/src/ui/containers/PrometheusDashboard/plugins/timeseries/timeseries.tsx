import cn from 'bem-cn-lite';
import React from 'react';

import {Flex} from '@gravity-ui/uikit';

import {type YTError} from '../../../../../@types/types';
import {type QueryRangeData, type TimeseriesTarget} from '../../../../../shared/prometheus/types';
import {KEY_WITH_DOUBLE_CURLY_BRACES, formatByParams} from '../../../../../shared/utils/format';

import format from '../../../../common/hammer/format';
import {YT} from '../../../../config/yt-config';

import {IntersectionObserverContainer} from '../../../../components/IntersectionObserverContainer/IntersectionObserverContainer';

import {type Yagr, type YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {InlineError} from '../../../../components/InlineError/InlineError';
import Loader from '../../../../components/Loader/Loader';
import {YTChartKitLazy, getChartSerieColor} from '../../../../components/YTChartKit';
import {useElementSize} from '../../../../hooks/useResizeObserver';
import {usePrometheusFetchQuery} from '../../../../store/api/prometheus';
import {compareWithUndefined} from '../../../../utils/sort-helpers';
import {rumLogError} from '../../../../rum/rum-counter';

import {usePrometheusDashboardContext} from '../../PrometheusDashboardContext/PrometheusDashboardContext';
import {type PrometheusPlugins} from '../../PrometheusDashKit';
import {PrometheusWidgetToolbar} from '../../PrometheusWidgetToolbar/PrometheusWidgetToolbar';
import {getPrometheusFormatter} from '../../utils/prometheus-format';
import {type PrometheusChartFieldConfig, usePrometheusChartFieldConfig} from './timeseries-config';
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

    const {
        error,
        data: chartData,
        isLoading,
    } = useLoadQueriesData({id, data, pointCount, from, to});

    const [yagr, setYagr] = React.useState<Yagr | null>();
    React.useEffect(() => {
        yagr?.subscribe();
        return () => {
            yagr?.unsubscribe();
        };
    }, [yagr]);

    return (
        <React.Fragment>
            <Flex ref={setElement} className={block('widget')} direction="column" id={id}>
                {chartData ? (
                    <YTChartKitLazy
                        type="yagr"
                        data={chartData}
                        onChartLoad={(d) => {
                            setYagr(d.widget);
                        }}
                    />
                ) : (
                    <>
                        <div className={block('widget-title')}>{title}</div>
                        {error && (
                            <div className={block('error')}>
                                <InlineError error={error} />
                            </div>
                        )}
                        {!chartData && isLoading && <Loader visible centered />}
                    </>
                )}
            </Flex>
            <PrometheusWidgetToolbar id={id} />
        </React.Fragment>
    );
}

function useLoadQueriesData({
    id,
    data: {title, targets, params, fieldConfig},
    pointCount,
    from,
    to,
}: Pick<PrometheusChartProps, 'data' | 'id'> & {pointCount?: number; from?: number; to?: number}) {
    // const [cancelHelper] = React.useState(new CancelHelper());

    const {__ytDashboardType: dashboardType} = params;

    const {data, isLoading, error} = usePrometheusFetchQuery({
        cluster: YT.cluster,
        dashboardType,
        id,
        from,
        to,
        pointCount,
        params,
        //cancelHelper,
    });

    const fieldOverrides = usePrometheusChartFieldConfig(fieldConfig);

    const chartData: {data?: YagrWidgetData; error?: YTError; isLoading?: boolean} =
        React.useMemo(() => {
            if (error) {
                return {error: error as YTError};
            }

            if (!data || !data?.responseData) {
                return {isLoading};
            }

            const {responseData: rawData, start, end, step} = data;
            const {results} = rawData;

            return {
                data: makeYagrWidgetData(
                    {title, ...fieldOverrides},
                    targets,
                    results,
                    {end, start, step},
                    params,
                ),
            };
        }, [data, error, params, targets, title, fieldOverrides, isLoading]);

    return chartData;
}

type YagrWidgetViewParams = PrometheusChartFieldConfig & {
    title: string;
};

function makeYagrWidgetData(
    {title, axisLabel, propertiesByRefId, showLegend}: YagrWidgetViewParams,
    targets: Array<TimeseriesTarget>,
    results: Array<QueryRangeData>,
    {end, start, step}: {end: number; start: number; step: number},
    params: Record<string, string | number>,
): YagrWidgetData {
    const scales: YagrWidgetData['libraryConfig']['scales'] = {};
    const res: YagrWidgetData = {
        data: {graphs: [], timeline: []},
        libraryConfig: {
            title: {text: title},
            legend: {show: showLegend},
            tooltip: {
                show: (y) => y.state.isMouseOver,
                title: {
                    y: ({x}) => {
                        return format.DateTime(x / 1000);
                    },
                },
                sort: {
                    y: ({value: left}, {value: right}) => {
                        if (isNaN(left as number)) {
                            return 1;
                        }
                        if (isNaN(right as number)) {
                            return -1;
                        }
                        return compareWithUndefined(left, right, -1, -1);
                    },
                },
            },
            axes: {
                y: {
                    label: axisLabel,
                },
            },
            scales,
            cursor: {sync: 'yt-timeseries-cursor'},
        },
    };

    for (let t = start; t - step * 0.5 < end; t += step) {
        res.data.timeline.push(t * 1000);
    }

    const {timeline} = res.data;

    const metrics: Array<{metric: Record<string, unknown>; graphIndex: number}> = [];

    let hasStacking = false;
    let lastUnit;

    for (let serie = 0; serie < results?.length; ++serie) {
        const {legendFormat, refId} = targets[serie];
        const {unit, custom: {stacking} = {}} = propertiesByRefId[refId] ?? {};
        for (let serie_i = 0; serie_i < (results[serie]?.data?.result?.length ?? 0); ++serie_i) {
            const serie_i_data = results[serie]?.data?.result[serie_i];
            if (!serie_i_data) {
                continue;
            }

            const {values = [], metric} = serie_i_data;

            hasStacking = hasStacking || stacking?.mode === 'normal';

            const formatter = getPrometheusFormatter(unit);
            const graph: (typeof res)['data']['graphs'][number] = {
                type: stacking?.mode === 'normal' ? 'area' : undefined,
                stackGroup: stacking?.mode === 'normal' ? 1 : undefined,
                name: legendFormat?.length
                    ? formatByParams(
                          legendFormat,
                          {...params, ...metric},
                          KEY_WITH_DOUBLE_CURLY_BRACES,
                      )
                    : undefined,
                data: new Array(timeline.length),
                formatter,
                color: getChartSerieColor(res.data.graphs.length),
            };
            if (!graph.name) {
                const graphIndex = res.data.graphs.length;
                metrics.push({metric, graphIndex});
            }
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

            if (lastUnit !== undefined && lastUnit !== unit) {
                rumLogError(
                    {message: 'Unexpected behavior: different unit types on the y-axis'},
                    new Error(`${lastUnit} != ${unit}`),
                );
            }
            lastUnit = unit;

            const yAxis = res.libraryConfig.axes?.y ?? {};
            yAxis.values = (_, splits) => {
                return splits.map(formatter);
            };
        }
    }

    if (hasStacking) {
        scales.y = {stacking: true};
    }

    for (let i = 0; i < metrics.length; ++i) {
        udpateMissingLegend(res.data.graphs, metrics, i);
    }

    return res;
}

function udpateMissingLegend(
    graphs: Array<{name?: string}>,
    metrics: Array<{metric: Record<string, unknown>; graphIndex: number}>,
    index: number,
) {
    const {metric, graphIndex} = metrics[index] ?? {};
    const {metric: otherMetric} = metrics[index === 0 ? 1 : 0] ?? {};

    const dst = graphs[graphIndex];
    dst.name = genSerieName(metric, otherMetric);
}

function genSerieName(obj: Record<string, unknown>, other: Record<string, unknown> = {}) {
    if (!obj) {
        return undefined;
    }

    const res = Object.keys(obj).reduce((acc, key) => {
        if (obj[key] === other[key]) {
            return acc;
        }

        const v = obj[key];
        const value = key === '__name__' ? v : `${key}:${v}; `;

        return acc + value;
    }, '');

    return Object.keys(other ?? {}).reduce((acc, key) => {
        if (key in obj) {
            return acc;
        }
        return acc + `${key}:${format.NO_VALUE}; `;
    }, res);
}
