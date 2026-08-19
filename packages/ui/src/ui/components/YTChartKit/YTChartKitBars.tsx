import React from 'react';

import {type ChartData, type TooltipDataChunkBarX} from '@gravity-ui/chartkit/gravity-charts';

import format from '../../common/hammer/format';
import {ColorCircle} from '../../components/ColorCircle/ColorCircle';

import {useMemoizedArgsWithIncarnaction} from './hack';
import {YTChartKitLazy} from '.';

export type YTChartKitBarsProps = {
    /** a bar per item, the items are displayed in the given order */
    data?: Array<{name: string; value: number}>;
    xAxisTitle?: string;
    yAxisTitle?: string;
};

export function YTChartKitBars(props: YTChartKitBarsProps) {
    const {
        memoizedArgs: [data = [], xAxisTitle, yAxisTitle],
        incarnation,
    } = useMemoizedArgsWithIncarnaction(props.data, props.xAxisTitle, props.yAxisTitle);

    const chartData = React.useMemo(() => {
        const res: ChartData = {
            legend: {enabled: false},
            xAxis: {
                min: 0,
                title: xAxisTitle === undefined ? undefined : {text: xAxisTitle},
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
                        name: yAxisTitle ?? '',
                        data: data.map(({value}, index) => {
                            return {x: index + 1, y: value, index};
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
                        data: pointData,
                        series: {color},
                    } = barData as TooltipDataChunkBarX;

                    const {y, index} = pointData as typeof pointData & {index: number};

                    return (
                        <React.Fragment>
                            <div>
                                <ColorCircle color={color ?? 'magenta'} />
                                {data[index]?.name}
                            </div>
                            <div>
                                <b>{format.NumberSmart(y, {significantDigits: 3})}</b>
                            </div>
                        </React.Fragment>
                    );
                },
            },
        };
        return res;
    }, [data, xAxisTitle, yAxisTitle]);

    return <YTChartKitLazy key={incarnation} type="gravity-charts" data={chartData} />;
}
