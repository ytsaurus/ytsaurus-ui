import React from 'react';
export type {ChartKitProps, ChartKitWidget, ChartKitRef} from './YTChartKit';
export type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import withLazyLoading from '../../hocs/withLazyLoading';
import type {YTChartKitType} from './YTChartKit';

export const YTChartKitLazy = withLazyLoading(
    React.lazy(async () => import(/* webpackChunkName: 'chart-kit' */ './YTChartKit')),
) as YTChartKitType;

const COLORS = [
    'rgb(77, 162, 241)',
    'rgb(255, 61, 100)',
    '#76a559',
    '#6a72b8',
    '#e98f27',
    '#b67598',
    '#ffdb80',
    '#c6cb8e',
    '#8dcaaf',
    '#bee9ef',
];

export function getSerieColor(serieIndex: number) {
    return COLORS[serieIndex % COLORS.length];
}

export {YTChartKitPie} from './YTChartKitPie';
export {YTChartKitHistogram} from './YTChartKitHistogram';
