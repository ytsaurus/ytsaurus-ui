import type {ChartAxis, ChartData} from '@gravity-ui/chartkit/d3';
import {QueryResult} from './types';
import {ChartType} from '../constants';
import {preparePie} from './preparePie';
import {Config, VisualizationState} from '../../../../store/reducers/query-tracker/queryChartSlice';
import {DateTime64Types, DateTimeTypes} from '../../../../types/query-tracker/yqlTypes';
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

const shouldUseDateTimeAxis = (result: QueryResult, xField: string): boolean => {
    if (!result.length || !result[0][xField]) return false;
    const xFieldType = result[0][xField].$type;
    return DateTimeTypes.includes(xFieldType) || DateTime64Types.includes(xFieldType);
};

export const prepareWidgetData = (
    result: QueryResult,
    {type, xField, yField, config}: VisualizationState,
): ChartData | null => {
    if (!xField || !yField.length || !result) return null;

    // Auto-detect datetime axis type based on data
    let adjustedConfig = config;
    if (shouldUseDateTimeAxis(result, xField) && config.xAxis.type === 'linear') {
        adjustedConfig = {
            ...config,
            xAxis: {
                ...config.xAxis,
                type: 'datetime' as const,
            },
        };
    }

    switch (type) {
        case ChartType.Pie: {
            return {
                series: {data: preparePie(result, xField, yField[0])},
                ...adjustedConfig,
            };
        }
        case ChartType.Waterfall: {
            return {
                series: {
                    data: yField.map((field) =>
                        prepareWaterfall(
                            result,
                            xField,
                            field,
                            adjustedConfig.xAxis.type === 'category',
                        ),
                    ),
                },
                ...adjustedConfig,
            };
        }
        case ChartType.BarX:
        case ChartType.Line:
        case ChartType.Area:
        case ChartType.Scatter: {
            return {
                series: {
                    data: yField.map((field) =>
                        prepareData(
                            result,
                            xField,
                            field,
                            type,
                            adjustedConfig.xAxis.type === 'category',
                        ),
                    ),
                    options,
                },
                ...adjustedConfig,
            };
        }
        case ChartType.BarY: {
            const newConfig: Config = {
                ...adjustedConfig,
                xAxis: {
                    type: 'linear',
                    title: adjustedConfig.xAxis.title,
                },
                yAxis: adjustedConfig.yAxis
                    ? adjustedConfig.yAxis.map((axis: ChartAxis) => ({
                          type: adjustedConfig.xAxis.type,
                          title: axis.title,
                          ...(adjustedConfig.xAxis.type === 'category'
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
                        prepareData(
                            result,
                            xField,
                            field,
                            type,
                            adjustedConfig.xAxis.type === 'category',
                        ),
                    ),
                    options,
                },
                ...newConfig,
            };
        }
    }

    return null;
};
