import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {PrepareLineArgs} from './types';
import {splitDataByColor} from './splitDataByColor';

export function prepareScatter(args: PrepareLineArgs): ChartKitWidgetData {
    const {visualization} = args;
    const rows = args.result;
    const xPlaceholder = visualization.placeholders.find((placeholder) => placeholder.id === 'x');
    const yPlaceholder = visualization.placeholders.find((placeholder) => placeholder.id === 'y');
    const colorPlaceholder = visualization.placeholders.find(
        (placeholder) => placeholder.id === 'colors',
    );
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
