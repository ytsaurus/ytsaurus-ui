import type {ChartSelectedFormValues} from '@gravity-ui/querieskit';

export type DashboardChartFormValues = Extract<
    ChartSelectedFormValues,
    {chartType: 'line' | 'area' | 'scatter' | 'bar-x' | 'bar-y' | 'pie'}
>;

/** Only form values are persisted; result rows are never stored in annotations. */
export type DashboardChartDefinition = {
    id: string;
    fieldsFormValues: DashboardChartFormValues;
};

export type DashboardLayoutItem = {i: string; x: number; y: number; w: number; h: number};

export type ResultDashboardConfig = {
    charts: DashboardChartDefinition[];
    layout: DashboardLayoutItem[];
};

export type DashboardChartsConfig = {
    version: 2;
    results: Record<string, ResultDashboardConfig>;
};
