import React from 'react';

import format from '../../common/hammer/format';

import {YTChartKitLazy} from '.';
import {ChartData, PieSeriesData} from '@gravity-ui/chartkit/gravity-charts';
import {useMemoizedArgsWithIncarnaction} from './hack';

type YTChartKitPieProps = {
    format: 'Bytes' | 'Number';
    data?: Record<string, number>;
};

export function YTChartKitPie({format: fmt = 'Number', ...rest}: YTChartKitPieProps) {
    const {
        memoizedArgs: [data = {}],
        incarnation,
    } = useMemoizedArgsWithIncarnaction(rest.data);

    const chartData = React.useMemo(() => {
        const sum =
            Object.values(data).reduce((acc, v) => {
                return acc + (isNaN(v) ? 0 : v);
            }, 0) || 1;

        return {
            legend: {enabled: true},
            series: {
                data: [
                    {
                        type: 'pie',
                        data: Object.keys(data).map((name) => {
                            const value = data[name];
                            return {
                                value,
                                name,
                                label: `${format.Percent((100 * value) / sum)}`,
                            };
                        }),
                    },
                ],
            },
            tooltip: {
                renderer({hovered}) {
                    const {data} = hovered[0] ?? {};
                    if (!data) {
                        return null;
                    }
                    const {value} = data as PieSeriesData;
                    return (
                        <>
                            <b>{format.Percent((100 * value!) / sum)}</b>&nbsp;&nbsp;&nbsp;
                            {format[fmt](value)}
                        </>
                    );
                },
            },
        } as ChartData;
    }, [data, fmt]);

    return <YTChartKitLazy key={incarnation} type="gravity-charts" data={chartData} />;
}
