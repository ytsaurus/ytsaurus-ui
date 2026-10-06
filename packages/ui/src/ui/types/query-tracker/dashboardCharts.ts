/** Only chart definitions are persisted; result rows are never stored in annotations. */
export type DashboardChartDefinition = {
    id: string;
    type: 'line' | 'area' | 'bar-x' | 'bar-y' | 'scatter' | 'pie' | 'waterfall';
    series: Array<{xField: string; yField: string}>;
    title?: string;
    xTitle?: string;
    yTitle?: string;
    axisType?: 'linear' | 'datetime' | 'logarithmic' | 'category';
    showLegend?: boolean;
};

export type DashboardLayoutItem = {i: string; x: number; y: number; w: number; h: number};

export type ResultDashboardConfig = {
    charts: DashboardChartDefinition[];
    layout: DashboardLayoutItem[];
};

export type DashboardChartsConfig = {
    version: 1;
    results: Record<string, ResultDashboardConfig>;
};
