import type {ChartKitWidgetAxisType, ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {PrepareLineArgs} from './types';
import {VisualizationId} from '../types';

// Inspired by
// https://github.com/datalens-tech/datalens-ui/blob/e978d82ce785d4321057942d0ff05a163c12ade7/src/server/modes/charts/plugins/datalens/d3/index.ts#L24

export function buildD3Config(args: PrepareLineArgs) {
    const chartSettings = args.visualization.chartSettings;

    const xAxisGridEnabled = true;
    const xAxisIsLegendEnabled = chartSettings.xAxis.legend === 'on';
    const xAxisEnableLabels = chartSettings.xAxis.labels === 'on';
    const xAxisTitle = chartSettings.xAxis.title;
    const xAxisPixelInterval = Number(chartSettings.xAxis.pixelInterval || '120');

    const yAxisEnableLabels = chartSettings.yAxis.labels === 'on';
    const yAxisTitle = chartSettings.yAxis.title;
    const yAxisGridEnabled = chartSettings.yAxis.grid === 'on';
    const yAxisPixelInterval = Number(chartSettings.yAxis.pixelInterval || '120');

    const chartWidgetData: Partial<ChartKitWidgetData> = {
        tooltip: {enabled: true},
        legend: {enabled: xAxisIsLegendEnabled},
        xAxis: {
            type: getAxisType(args.visualization.id),
            labels: {
                enabled: xAxisEnableLabels,
            },
            title: {
                text: xAxisTitle,
            },
            grid: {
                enabled: xAxisGridEnabled,
            },
            ticks: {
                pixelInterval: xAxisPixelInterval,
            },
        },
        yAxis: [
            {
                // todo: the axis type should depend on the type of field
                type: 'linear',
                lineColor: 'transparent',
                labels: {
                    enabled: yAxisEnableLabels,
                },
                title: {
                    text: yAxisTitle,
                },
                grid: {
                    enabled: yAxisGridEnabled,
                },
                ticks: {
                    pixelInterval: yAxisPixelInterval,
                },
            },
        ],
        series: {
            data: [],
            options: {
                'bar-x': {
                    barMaxWidth: 50,
                    barPadding: 0.05,
                    groupPadding: 0.4,
                    dataSorting: {
                        direction: 'desc',
                        key: 'name',
                    },
                },
                line: {
                    lineWidth: 2,
                },
            },
        },
        chart: {
            margin: {
                top: 10,
                left: 10,
                right: 10,
                bottom: 15,
            },
        },
    };

    return chartWidgetData;
}

// Write this function, using reference:
// https://github.com/datalens-tech/datalens-ui/blob/e978d82ce785d4321057942d0ff05a163c12ade7/src/server/modes/charts/plugins/datalens/preparers/helpers/axis.ts
function getAxisType(visualizationId: VisualizationId): ChartKitWidgetAxisType {
    return visualizationId === 'scatter' ? 'linear' : 'category';
}
