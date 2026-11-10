export type DashboardChartAppearance = {chartTitle?: string; showLegend?: boolean};
export type DashboardChartFormValues = DashboardChartAppearance &
    (
        | {
              chartType: 'line' | 'area' | 'scatter' | 'bar-x' | 'bar-y';
              dimensionFieldId: string;
              dimensionAxisType: 'category' | 'datetime' | 'linear' | 'logarithmic';
              measureItems: {id: string; fieldId: string}[];
              xTitle?: string;
              yTitle?: string;
          }
        | {
              chartType: 'pie';
              categoryFieldId: string;
              valueFieldId: string;
          }
    );

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
