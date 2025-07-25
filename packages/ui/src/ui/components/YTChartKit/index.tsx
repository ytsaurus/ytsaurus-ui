import React from 'react';
export type {ChartKitProps, ChartKitWidget, ChartKitRef} from './YTChartKit';
export type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import withLazyLoading from '../../hocs/withLazyLoading';

export const YTChartKitLazy = withLazyLoading(
    React.lazy(async () => import(/* webpackChunkName: 'chart-kit' */ './YTChartKit')),
);

const COLORS = ['rgb(77, 162, 241)', 'rgb(255, 61, 100)'];

export function getSerieColor(serieIndex: number) {
    return COLORS[serieIndex % COLORS.length];
}
