import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import {QueryResult} from './types';
import {ChartType} from '../constants';
import {preparePie} from './preparePie';
import {Config, VisualizationState} from '../../module/queryChart/queryChartSlice';
import {prepareData} from './prepareData';
import type {ChartKitWidgetSeriesOptions} from '@gravity-ui/chartkit/build/types/widget-data/series';
import {getPointValue} from './getPointData';
import {prepareWaterfall} from './prepareWaterfall';

const options: ChartKitWidgetSeriesOptions = {
    [ChartType.BarX]: {
        barMaxWidth: 50,
        barPadding: 0.05,
        groupPadding: 0.4,
        dataSorting: {
            direction: 'desc',
            key: 'name',
        },
    },
    [ChartType.Line]: {
        lineWidth: 2,
    },
};

export const prepareWidgetData = (
    result: QueryResult,
    {type, xField, yField, config}: VisualizationState,
): ChartKitWidgetData | null => {
    if (!xField || !yField.length || !result) return null;

    switch (type) {
        case ChartType.Pie: {
            return {
                series: {data: preparePie(result, xField, yField[0])},
                ...config,
            };
        }
        case ChartType.Waterfall: {
            return {
                series: {
                    data: yField.map((field) =>
                        prepareWaterfall(result, xField, field, config.xAxis.type === 'category'),
                    ),
                },
                ...config,
            };
        }
        case ChartType.BarX:
        case ChartType.Line:
        case ChartType.Area:
        case ChartType.Scatter: {
            return {
                series: {
                    data: yField.map((field) =>
                        prepareData(result, xField, field, type, config.xAxis.type === 'category'),
                    ),
                    options,
                },
                ...config,
            };
        }
        case ChartType.BarY: {
            const newConfig: Config = {
                ...config,
                xAxis: {
                    type: 'linear',
                    title: config.xAxis.title,
                },
                yAxis: config.yAxis
                    ? config.yAxis.map((axis) => ({
                          type: config.xAxis.type,
                          title: axis.title,
                          ...(config.xAxis.type === 'category'
                              ? {
                                    categories: result.map((row) =>
                                        getPointValue(row[xField]).toString(),
                                    ),
                                }
                              : {}),
                      }))
                    : [],
            };

            return {
                series: {
                    data: yField.map((field) =>
                        prepareData(result, xField, field, type, config.xAxis.type === 'category'),
                    ),
                    options,
                },
                ...newConfig,
            };
        }
    }

    return null;
};
