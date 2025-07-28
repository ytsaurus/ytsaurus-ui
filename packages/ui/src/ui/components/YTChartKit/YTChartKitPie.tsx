import React from 'react';

import format from '../../common/hammer/format';

import {ChartKitWidgetData, YTChartKitLazy} from '.';
import {PieSeriesData} from '@gravity-ui/chartkit/build';

type YTChartKitPieProps = {
    format: 'Bytes' | 'Number';
    data?: Record<string, number>;
};

export function YTChartKitPie({format: fmt = 'Number', data = {}}: YTChartKitPieProps) {
    const chartData: ChartKitWidgetData = React.useMemo(() => {
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
                                label: `${format.Percent(value / sum)}`,
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
                            <b>{format.Percent(value / sum)}</b>&nbsp;&nbsp;&nbsp;
                            {format[fmt](value)}
                        </>
                    );
                },
            },
        } as ChartKitWidgetData;
    }, [data, fmt]);

    return <YTChartKitLazy type="d3" data={chartData} />;
}
