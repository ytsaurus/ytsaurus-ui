import React from 'react';

import {LineSeries, TooltipDataChunkBarX} from '@gravity-ui/chartkit';

import format from '../../common/hammer/format';
import {ColorCircle} from '../../components/ColorCircle/ColorCircle';

import {ChartKitWidgetData, YTChartKitLazy} from '.';

export type YTChartKitHistogramProps = {
    data?: Array<number>;
    /** by default it uses 10 */
    barCount?: number;
    xPlotLines?: Record<string, number | undefined>;
};

export function YTChartKitHistogram({
    data = [],
    barCount = 10,
    xPlotLines = {},
}: YTChartKitHistogramProps) {
    const chartData = React.useMemo(() => {
        const {min, max} = data.reduce(
            (acc, v) => {
                acc.min = v < acc.min ? v : acc.min;
                acc.max = v > acc.max ? v : acc.max;
                return acc;
            },
            {min: Infinity, max: -Infinity},
        );

        const effectiveMax = max + (max - min) * 0.001;

        const step = (effectiveMax - min) / barCount;
        let maxSum = 0;
        const values = data.reduce(
            (acc, v) => {
                const index = Math.floor((v - min) / step);
                acc[index] += 1;
                maxSum = Math.max(maxSum, acc[index]);
                return acc;
            },
            Array.from({length: barCount}, () => 0),
        );

        const plotLinesMax = maxSum * 1.05;
        const plotLines = Object.entries(xPlotLines).reduce((acc, [name, value]) => {
            // TODO: fixme whem when https://github.com/gravity-ui/charts/issues/87 is ready
            // isInRange value  should be calculated as
            // const isInRange = value !== undefined;
            const isInRange = value !== undefined && value >= min && value <= max;
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

        const res: ChartKitWidgetData = {
            legend: {enabled: true},
            xAxis: {
                min,
                // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                // max,
            },
            yAxis: [
                {
                    min,
                    // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                    // max: plotLinesMax,
                },
            ],
            series: {
                data: [
                    {
                        type: 'bar-x',
                        name: 'Observations',
                        data: values.map((value, index) => {
                            return {
                                x: min + step * index + step * 0.5,
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
                    const l = min + step * index;
                    const r = l + step;

                    return (
                        <React.Fragment>
                            <div>
                                <ColorCircle color={color ?? 'magenta'} />
                                <b>{format.Number(y, {digits: 0})}</b> observations in range from{' '}
                                <b>{fmt(l)}</b> to <b>{fmt(r)}</b>
                            </div>
                        </React.Fragment>
                    );
                },
            },
        };
        return res;
    }, [data, barCount]);
    return <YTChartKitLazy type="d3" data={chartData} />;
}
