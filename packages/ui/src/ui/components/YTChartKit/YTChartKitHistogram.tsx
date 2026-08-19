import React from 'react';

import {type ChartData, type TooltipDataChunkBarX} from '@gravity-ui/chartkit/gravity-charts';

import format from '../../common/hammer/format';
import {ColorCircle} from '../../components/ColorCircle/ColorCircle';

import {useMemoizedArgsWithIncarnaction} from './hack';
import {YTChartKitLazy} from '.';
import i18n from './i18n';

export type YTChartKitHistogramProps = {
    data?: Array<number>;
    /** by default it uses 10 */
    barCount?: number;
    /**
     * Fixed width of a bar, the bars are aligned to zero.
     * When the values do not fit into |maxBarCount| bars the width grows by a whole number of times.
     */
    barWidth?: number;
    /** by default it uses 50, it is used with |barWidth| only */
    maxBarCount?: number;
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
            barWidth,
            maxBarCount = 50,
            seriesName,
            xAxisTitle,
            yAxisTitle,
        ],
        incarnation,
    } = useMemoizedArgsWithIncarnaction(
        props.data,
        props.barCount,
        props.barWidth,
        props.maxBarCount,
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

        const from = barWidth === undefined ? min : 0;
        const effectiveMax = max + (max - from) * 0.001;

        let step = (effectiveMax - from) / barCount;
        let count = barCount;
        if (barWidth !== undefined) {
            const times = Math.ceil((effectiveMax - from) / (barWidth * maxBarCount));
            step = barWidth * Math.max(1, times);
            count = Math.max(1, Math.ceil((effectiveMax - from) / step));
        }

        const values = data.reduce(
            (acc, v) => {
                const index = Math.min(count - 1, Math.floor((v - from) / step));
                acc[index] += 1;
                return acc;
            },
            Array.from({length: count}, () => 0),
        );

        const fmt = (v?: number | string) => {
            return format.NumberSmart(v, {significantDigits: 3});
        };

        const name = seriesName ?? i18n('field_observations');

        const res: ChartData = {
            legend: {enabled: false},
            xAxis: {
                min: from,
                title: xAxisTitle === undefined ? undefined : {text: xAxisTitle},
                // TODO: uncomment the line below when https://github.com/gravity-ui/charts/issues/87 is ready
                // max: from + step * count,
            },
            yAxis: [
                {
                    min: 0,
                    title: yAxisTitle === undefined ? undefined : {text: yAxisTitle},
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

                    return (
                        <React.Fragment>
                            <div>
                                <ColorCircle color={color ?? 'magenta'} />
                                {name}: <b>{format.Number(y, {digits: 0})}</b>
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
    }, [data, barCount, barWidth, maxBarCount, seriesName, xAxisTitle, yAxisTitle]);

    return <YTChartKitLazy key={incarnation} type="gravity-charts" data={chartData} />;
}
