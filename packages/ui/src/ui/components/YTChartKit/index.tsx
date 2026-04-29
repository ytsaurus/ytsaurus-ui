import React from 'react';
export type {ChartKitProps, ChartKitWidget, ChartKitRef} from './YTChartKit';
export type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import withLazyLoading from '../../hocs/withLazyLoading';
import {type YTChartKitType} from './YTChartKit';

export const YTChartKitLazy = withLazyLoading(
    React.lazy(async () => import(/* webpackChunkName: 'chart-kit' */ './YTChartKit')),
) as YTChartKitType;

export {YTChartKitPie} from './YTChartKitPie';
export {YTChartKitHistogram} from './YTChartKitHistogram';
