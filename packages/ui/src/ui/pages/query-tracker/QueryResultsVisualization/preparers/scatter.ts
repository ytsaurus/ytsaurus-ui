import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {PrepareLineArgs} from './types';
import {splitDataByColor} from './splitDataByColor';
import {getVisualizationPlaceholders} from './utils';

export function prepareScatter(args: PrepareLineArgs): ChartKitWidgetData {
    const {visualization} = args;
    const rows = args.result;
    const {xPlaceholder, yPlaceholder, colorPlaceholder} =
        getVisualizationPlaceholders(visualization);
    const [colorField] = [colorPlaceholder?.field] || [];

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
        return {
            series: {
                data: splitDataByColor({
                    rows,
                    yFieldName: yField,
                    xFieldName: xField,
                    colorFieldName: colorField,
                }).map((item) => ({
                    data: item.data.map(({x, y}) => ({
                        x: Number(x),
                        y: Number(y),
                    })),
                    name: item.name,
                    type: 'scatter',
                })),
            },
        };
    }

    return {
        series: {
            data: [
                {
                    type: 'scatter',
                    data: rows.map((row) => {
                        return {
                            x: Number(row[xField].$rawValue),
                            y: Number(row[yField].$rawValue),
                        };
                    }),
                    name: `${xField} x ${yField}`,
                },
            ],
        },
    };
}
