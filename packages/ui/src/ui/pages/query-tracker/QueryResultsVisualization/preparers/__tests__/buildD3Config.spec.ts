import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import {buildD3Config} from '../d3config';
import {PrepareLineArgs} from '../types';

type ChartSettings = PrepareLineArgs['visualization']['chartSettings'];

describe('buildD3Config', () => {
    it('should build the correct D3 config based on the given chart settings', () => {
        const mockChartSettings: ChartSettings = {
            xAxis: {
                legend: 'on',
                labels: 'on',
                title: 'Sample X Axis',
                grid: 'on',
                pixelInterval: '100',
            },
            yAxis: {
                labels: 'on',
                title: 'Sample Y Axis',
                grid: 'on',
                pixelInterval: '80',
            },
        };

        const args: PrepareLineArgs = {
            visualization: {
                id: 'line',
                placeholders: [],
                chartSettings: mockChartSettings,
            },
            result: [],
        };

        const expectedConfig: Partial<ChartKitWidgetData> = {
            tooltip: {enabled: true},
            legend: {enabled: true},
            xAxis: {
                type: 'category',
                labels: {
                    enabled: true,
                },
                title: {
                    text: 'Sample X Axis',
                },
                grid: {
                    enabled: true,
                },
                ticks: {
                    pixelInterval: 100,
                },
            },
            yAxis: [
                {
                    type: 'linear',
                    lineColor: 'transparent',
                    labels: {
                        enabled: true,
                    },
                    title: {
                        text: 'Sample Y Axis',
                    },
                    grid: {
                        enabled: true,
                    },
                    ticks: {
                        pixelInterval: 80,
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

        const result = buildD3Config(args);
        expect(result).toEqual(expectedConfig);
    });

    it('should set default pixel intervals if not specified', () => {
        const mockChartSettings: ChartSettings = {
            xAxis: {
                legend: 'off',
                labels: 'off',
                title: '',
                grid: 'on',
                pixelInterval: '',
            },
            yAxis: {
                labels: 'off',
                title: '',
                grid: 'on',
                pixelInterval: '',
            },
        };

        const args: PrepareLineArgs = {
            visualization: {
                id: 'line',
                placeholders: [],
                chartSettings: mockChartSettings,
            },
            result: [],
        };

        const expectedConfig: Partial<ChartKitWidgetData> = {
            tooltip: {enabled: true},
            legend: {enabled: false},
            xAxis: {
                type: 'category',
                labels: {
                    enabled: false,
                },
                title: {
                    text: '',
                },
                grid: {
                    enabled: true,
                },
                ticks: {
                    pixelInterval: 120,
                },
            },
            yAxis: [
                {
                    type: 'linear',
                    lineColor: 'transparent',
                    labels: {
                        enabled: false,
                    },
                    title: {
                        text: '',
                    },
                    grid: {
                        enabled: true,
                    },
                    ticks: {
                        pixelInterval: 120,
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

        const result = buildD3Config(args);
        expect(result).toEqual(expectedConfig);
    });
});
