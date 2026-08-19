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
     * When defined the bars are aligned to zero and no bar is narrower than the value.
     * It prevents magnification of negligible differences between the values.
     */
    minBarWidth?: number;
    /** by default it uses 'Observations' */
    seriesName?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
};

export function YTChartKitHistogram(props: YTChartKitHistogramProps) {
    const {
        memoizedArgs: [
            data = [],
            barCount = 10,
            xPlotLines = {},
            minBarWidth,
            seriesName,
            xAxisTitle,
            yAxisTitle,
        ],
        incarnation,
    } = useMemoizedArgsWithIncarnaction(
        props.data,
        props.barCount,
        props.xPlotLines,
        props.minBarWidth,
        props.seriesName,
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

        const from = minBarWidth === undefined ? min : 0;
        const effectiveMax = max + (max - from) * 0.001;

        let step = (effectiveMax - from) / barCount;
        let count = barCount;
        if (minBarWidth !== undefined && step < minBarWidth) {
            step = minBarWidth;
            count = Math.max(1, Math.ceil((effectiveMax - from) / step));
        }

        const to = from + step * count;

        let maxSum = 0;
        const values = data.reduce(
            (acc, v) => {
                const index = Math.min(count - 1, Math.floor((v - from) / step));
                acc[index] += 1;
                maxSum = Math.max(maxSum, acc[index]);
                return acc;
            },
            Array.from({length: count}, () => 0),
        );

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
                    data: isInRange
                        ? [
                              {x: value, y: 0},
                              {x: value, y: plotLinesMax},
                          ]
                        : [],
                });
            }
            return acc;
        }, [] as Array<LineSeries>);

        const fmt = (v?: number | string) => {
            return format.Number(v, {digits: 2});
        };

        const res: ChartData = {
            legend: {enabled: true},
            xAxis: {
                min: from,
                title: xAxisTitle === undefined ? undefined : {text: xAxisTitle},
                // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                // max: to,
            },
            yAxis: [
                {
                    min: 0,
                    title: yAxisTitle === undefined ? undefined : {text: yAxisTitle},
                    // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                    // max: plotLinesMax,
                },
            ],
            series: {
                data: [
                    {
                        type: 'bar-x',
                        name: seriesName ?? i18n('field_observations'),
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
                    const r = l + step;

                    return (
                        <React.Fragment>
                            <div>
                                <ColorCircle color={color ?? 'magenta'} />
                                {i18n('context_observations-in-range', {
                                    count: format.Number(y, {digits: 0}),
                                    from: fmt(l),
                                    to: fmt(r),
                                })}
                            </div>
                        </React.Fragment>
                    );
                },
            },
        };
        return res;
    }, [data, barCount, xPlotLines, minBarWidth, seriesName, xAxisTitle, yAxisTitle]);

    return <YTChartKitLazy key={incarnation} type="gravity-charts" data={chartData} />;
}
