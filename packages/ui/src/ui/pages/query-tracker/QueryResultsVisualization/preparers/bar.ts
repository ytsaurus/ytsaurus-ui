import uniq_ from 'lodash/uniq';
import map_ from 'lodash/map';
import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {PrepareLineArgs, QueryResult} from './types';
import {VisualizationId} from '../types';
import {splitDataByColor} from './splitDataByColor';
import {getPointValue} from './getPointData';
import {getVisualizationPlaceholders} from './utils';

// Inspired by datalens ql chart
// https://github.com/datalens-tech/datalens-ui/blob/e978d82ce785d4321057942d0ff05a163c12ade7/src/server/modes/charts/plugins/ql/preparers/line.ts#L82

interface PrepareColoredSeriesDataArgs {
    rows: QueryResult;
    xField: string;
    yField: string;
    colorField: string;
    visualizationId: VisualizationId;
}

function prepareColoredSeriesData({
    rows,
    xField,
    yField,
    colorField,
    visualizationId,
}: PrepareColoredSeriesDataArgs): ChartKitWidgetData {
    const xFieldPath = `${xField}.$rawValue`;

    return {
        series: {
            data: splitDataByColor({
                rows,
                xFieldName: xField,
                yFieldName: yField,
                colorFieldName: colorField,
            }).map((item) => {
                return {
                    type: visualizationId,
                    stacking: 'normal',
                    name: item.name,
                    data: item.data,
                };
            }),
        },
        xAxis: {
            type: 'category',
            categories: uniq_(map_(rows, xFieldPath) as unknown as string[]),
        },
    };
}

interface PrepareSeriesDataArgs {
    rows: QueryResult;
    xField: string;
    yField: string;
    visualizationId: VisualizationId;
}

function prepareSeriesData({
    xField,
    yField,
    rows,
    visualizationId,
}: PrepareSeriesDataArgs): ChartKitWidgetData {
    const result: Record<any, any> = {};

    let xValues: (string | number)[] = [];

    const dataMatrix: Record<string, any> = {};

    rows.forEach((row) => {
        const xRowItem = row[xField];
        const xValue = xRowItem.$rawValue;

        xValues.push(xValue);

        dataMatrix[xValue] = getPointValue(row[yField]);
    });

    xValues = Array.from(new Set(xValues));

    result.categories = xValues.map((value) => value);

    result.graphs = [];

    const graph = {
        data: xValues.map((xValue) => {
            return dataMatrix[String(xValue)];
        }),
    };

    result.graphs?.push(graph);

    return {
        series: {
            data: [
                {
                    type: visualizationId,
                    data: result.graphs[0].data.map((item: string, index: number) => {
                        return {
                            x: result.categories[index],
                            y: Number(item),
                        };
                    }),
                    name: yField,
                },
            ],
        },
        xAxis: {
            type: 'category',
            categories: result.categories,
        },
    };
}

export function prepareBar(args: PrepareLineArgs): ChartKitWidgetData {
    const {visualization} = args;
    const visualizationId = visualization.id;
    const rows = args.result;
    const {xPlaceholder, yPlaceholder, colorPlaceholder} =
        getVisualizationPlaceholders(visualization);

    const colorField = colorPlaceholder?.field;
    const xField = xPlaceholder?.field;
    const yField = yPlaceholder?.field;

    if (!xField || !yField) {
        return {
            series: {
                data: [],
            },
        };
    }

    if (colorField) {
        return prepareColoredSeriesData({
            rows,
            yField,
            xField,
            colorField,
            visualizationId,
        });
    }

    return prepareSeriesData({
        rows,
        yField,
        xField,
        visualizationId,
    });
}
