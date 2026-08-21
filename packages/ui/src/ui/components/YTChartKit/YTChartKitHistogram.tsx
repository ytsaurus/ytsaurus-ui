import React from 'react';

import {
    type ChartData,
    type LineSeries,
    type TooltipDataChunkBarX,
} from '@gravity-ui/chartkit/gravity-charts';

import format from '../../common/hammer/format';
import {ColorCircle} from '../../components/ColorCircle/ColorCircle';

import {useMemoizedArgsWithIncarnaction} from './hack';
import {YTChartKitLazy} from '.';
import i18n from './i18n';

export type YTChartKitHistogramProps = {
    data?: Array<number>;
    /** by default it uses 10 */
    barCount?: number;
    xPlotLines?: Record<string, number | undefined>;
    /**
     * Fixed width of a bar, the bars are aligned to zero. Unlike |barCount| it keeps the bars of
     * different charts of the same value comparable.
     * When the values do not fit into |maxBarCount| bars the width grows by a whole number of times.
     */
    barWidth?: number;
    /** by default it uses 50, it is used with |barWidth| only */
    maxBarCount?: number;
    /** by default it uses 'Observations' */
    seriesName?: string;
    /** by default it uses the minimum of |data| */
    yAxisMin?: number;
    xAxisTitle?: string;
    yAxisTitle?: string;
};

export function YTChartKitHistogram(props: YTChartKitHistogramProps) {
    const {
        memoizedArgs: [
            data = [],
            barCount = 10,
            xPlotLines = {},
            barWidth,
            maxBarCount = 50,
            seriesName,
            yAxisMin,
            xAxisTitle,
            yAxisTitle,
        ],
        incarnation,
    } = useMemoizedArgsWithIncarnaction(
        props.data,
        props.barCount,
        props.xPlotLines,
        props.barWidth,
        props.maxBarCount,
        props.seriesName,
        props.yAxisMin,
        props.xAxisTitle,
        props.yAxisTitle,
    );

    const chartData = React.useMemo(() => {
        const {min, max} = data.reduce(
            (acc, v) => {
                acc.min = v < acc.min ? v : acc.min;
                acc.max = v > acc.max ? v : acc.max;
                return acc;
            },
            {min: Infinity, max: -Infinity},
        );

        // There are two ways to place the bars. By default they are spread over the range of the
        // data, so the chart looks the same for values differing by 0.1% and by 100%. With
        // |barWidth| the bars have a fixed width and start at zero, so a value always falls into
        // the same bar and charts of the same metric can be compared with each other.
        const from = barWidth === undefined ? min : 0;
        const effectiveMax = max + (max - from) * 0.001;

        let step = (effectiveMax - from) / barCount;
        let count = barCount;
        if (barWidth !== undefined) {
            // Widen the bars by a whole number of times to keep their borders round.
            const times = Math.ceil((effectiveMax - from) / (barWidth * maxBarCount));
            step = barWidth * Math.max(1, times);
            count = Math.max(1, Math.ceil((effectiveMax - from) / step));
        }

        let maxSum = 0;
        const values = data.reduce(
            (acc, v) => {
                // The last bar is half-open, rounding of |effectiveMax| may move a value out of it.
                const index = Math.min(count - 1, Math.floor((v - from) / step));
                acc[index] += 1;
                maxSum = Math.max(maxSum, acc[index]);
                return acc;
            },
            Array.from({length: count}, () => 0),
        );

        const to = from + step * count;
        const plotLinesMax = maxSum * 1.05;
        const plotLines = Object.entries(xPlotLines).reduce((acc, [name, value]) => {
            // TODO: fixme whem when https://github.com/gravity-ui/charts/issues/87 is ready
            // isInRange value  should be calculated as
            // const isInRange = value !== undefined;
            const isInRange = value !== undefined && value >= from && value <= to;
            if (isInRange) {
                acc.push({
                    type: 'line',
                    name: format.ReadableField(name),
                    data: [
                        {x: value, y: 0},
                        {x: value, y: plotLinesMax},
                    ],
                });
            }
            return acc;
        }, [] as Array<LineSeries>);

        const fmt = (v?: number | string) => {
            // |seriesName| is provided for values of an arbitrary magnitude, e.g. cpu usage of 0.002.
            return seriesName === undefined
                ? format.Number(v, {digits: 2})
                : format.NumberSmart(v, {significantDigits: 3});
        };

        const name = seriesName ?? i18n('field_observations');

        const res: ChartData = {
            chart: {zoom: {enabled: true}},
            // A single named series does not need a legend, |xPlotLines| are named in it though.
            legend: {enabled: seriesName === undefined || plotLines.length > 0},
            xAxis: {
                min: from,
                title: xAxisTitle === undefined ? undefined : {text: xAxisTitle},
                // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                // max: to,
            },
            yAxis: [
                {
                    min: yAxisMin ?? min,
                    title: yAxisTitle === undefined ? undefined : {text: yAxisTitle},
                    // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                    // max: plotLinesMax,
                },
            ],
            series: {
                data: [
                    {
                        type: 'bar-x',
                        name,
                        data: values.map((value, index) => {
                            return {
                                x: from + step * index + step * 0.5,
                                y: value,
                                index,
                            };
                        }),
                    },
                    ...plotLines,
                ],
            },
            tooltip: {
                renderer({hovered}) {
                    const barData = hovered.find((item) => {
                        return item.series.type === 'bar-x';
                    });
                    if (!barData) {
                        return null;
                    }

                    const {
                        data,
                        series: {color},
                    } = barData as TooltipDataChunkBarX;

                    const {y, index} = data as typeof data & {index: number};
                    const l = from + step * index;
                    const count = format.Number(y, {digits: 0});

                    return seriesName === undefined ? (
                        <div>
                            <ColorCircle color={color ?? 'magenta'} />
                            {i18n('context_observations-in-range', {
                                count,
                                from: fmt(l),
                                to: fmt(l + step),
                            })}
                        </div>
                    ) : (
                        <React.Fragment>
                            <div>
                                <ColorCircle color={color ?? 'magenta'} />
                                {seriesName}: <b>{count}</b>
                            </div>
                            <div>
                                {fmt(l)} &ndash; {fmt(l + step)}
                            </div>
                        </React.Fragment>
                    );
                },
            },
        };
        return res;
    }, [
        data,
        barCount,
        xPlotLines,
        barWidth,
        maxBarCount,
        seriesName,
        yAxisMin,
        xAxisTitle,
        yAxisTitle,
    ]);

    return <YTChartKitLazy key={incarnation} type="gravity-charts" data={chartData} />;
}
