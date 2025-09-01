import React from 'react';

import ChartKit, {ChartKitProps, ChartKitRef, ChartKitWidget, settings} from '@gravity-ui/chartkit';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {D3Plugin} from '@gravity-ui/chartkit/d3';

import '@gravity-ui/yagr/dist/index.css';

settings.set({plugins: [...settings.get('plugins'), YagrPlugin, D3Plugin]});

export type {ChartKitProps, ChartKitWidget, ChartKitRef};

export default function YTChartKit<T extends keyof ChartKitWidget>({
    chartRef,
    ...props
}: ChartKitProps<T> & {chartRef?: React.ForwardedRef<ChartKitRef>}) {
    return <ChartKit<T> {...props} {...({ref: chartRef} as any)} />;
}

export type YTChartKitType = typeof YTChartKit;
