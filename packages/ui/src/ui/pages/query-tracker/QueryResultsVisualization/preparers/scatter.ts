import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {PrepareLineArgs} from './types';
import {splitDataByColor} from './splitDataByColor';
import {getVisualizationPlaceholders} from './utils';

export function prepareScatter(args: PrepareLineArgs): ChartKitWidgetData {
    const {visualization} = args;
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
        return {
            series: {
                data: splitDataByColor({
                    rows,
                    yFieldName: yField.name,
                    xFieldName: xField.name,
                    colorFieldName: colorField?.name,
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

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'scatter',
                    data: rows.map((row) => {
                        return {
                            x: Number(row[xField.name].$rawValue),
                            y: Number(row[yField.name].$rawValue),
                        };
                    }),
                    name: `${xField.name} x ${yField.name}`,
                },
            ],
        },
    };

    return widgetData;
}
