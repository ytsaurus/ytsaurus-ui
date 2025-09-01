import type {ChartAxis, ChartData} from '@gravity-ui/chartkit/d3';
import {QueryResult} from './types';
import {ChartType} from '../constants';
import {preparePie} from './preparePie';
import {Config, VisualizationState} from '../../module/queryChart/queryChartSlice';
import {prepareData} from './prepareData';
import {getPointValue} from './getPointData';
import {prepareWaterfall} from './prepareWaterfall';

const options = {
    [ChartType.BarX]: {
        barMaxWidth: 50,
        barPadding: 0.05,
        groupPadding: 0.4,
        dataSorting: {
            direction: 'desc' as const,
            key: 'name' as const,
        },
    },
    [ChartType.Line]: {
        lineWidth: 2,
    },
};

export const prepareWidgetData = (
    result: QueryResult,
    {type, xField, yField, config}: VisualizationState,
): ChartData | null => {
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
                    ? config.yAxis.map((axis: ChartAxis) => ({
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
