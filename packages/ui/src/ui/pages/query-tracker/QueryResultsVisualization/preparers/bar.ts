import uniq from 'lodash/uniq';
import map from 'lodash/map';
import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {PrepareLineArgs, QueryResult} from './types';
import {Field, VisualizationId} from '../types';
import {splitDataByColor} from './splitDataByColor';
import {getPointValue} from './getPointData';
import {getVisualizationPlaceholders} from './utils';

// Inspired by datalens ql chart
// https://github.com/datalens-tech/datalens-ui/blob/e978d82ce785d4321057942d0ff05a163c12ade7/src/server/modes/charts/plugins/ql/preparers/line.ts#L82

interface PrepareColoredSeriesDataArgs {
    rows: QueryResult;
    xField: Field;
    yField: Field;
    colorField: Field;
    visualizationId: VisualizationId;
}

function prepareColoredSeriesData({
    rows,
    xField,
    yField,
    colorField,
    visualizationId,
}: PrepareColoredSeriesDataArgs): ChartKitWidgetData {
    const xFieldPath = `${xField.name}.$rawValue`;

    return {
        series: {
            data: splitDataByColor({
                rows,
                xFieldName: xField.name,
                yFieldName: yField.name,
                colorFieldName: colorField?.name,
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
            categories: uniq(map(rows, xFieldPath) as unknown as string[]),
        },
    };
}

interface PrepareSeriesDataArgs {
    rows: QueryResult;
    xField: Field;
    yField: Field;
    visualizationId: VisualizationId;
    yFields: Field[];
}

function prepareSeriesData({
    xField,
    yField,
    yFields,
    rows,
    visualizationId,
}: PrepareSeriesDataArgs): ChartKitWidgetData {
    const result: Record<any, any> = {};

    let xValues: (string | number)[] = [];

    const dataMatrix: Record<string, any> = {};

    rows.forEach((row) => {
        const xRowItem = row[xField.name];
        const xValue = xRowItem.$rawValue;

        xValues.push(xValue);

        yFields.forEach((field) => {
            dataMatrix[xValue] = getPointValue(row[field.name]);
        });
    });

    xValues = Array.from(new Set(xValues));

    result.categories = xValues.map((value) => value);

    result.graphs = [];

    yFields.forEach(() => {
        const graph = {
            data: xValues.map((xValue) => {
                return dataMatrix[String(xValue)];
            }),
        };

        result.graphs?.push(graph);
    });

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
                    name: yField.name,
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

    const [xField] = xPlaceholder?.fields || [];
    const yFields = yPlaceholder?.fields || [];
    const [yField] = yFields;
    const [colorField] = colorPlaceholder?.fields || [];

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
        yFields,
        visualizationId,
    });
}
