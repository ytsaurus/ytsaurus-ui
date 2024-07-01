export type Field = {
    name: string;
};

export type PlaceholderId = 'x' | 'y' | 'colors';

export type Placeholder = {
    id: PlaceholderId;
    fields: Field[];
};

type RadioSetting = 'on' | 'off';

type StringSetting = string;

export type ChartSettings = {
    xAxis: {
        legend: RadioSetting;
        labels: RadioSetting;
        title: StringSetting;
        grid: RadioSetting;
        pixelInterval: StringSetting;
    };
    yAxis: {
        labels: RadioSetting;
        title: StringSetting;
        grid: RadioSetting;
        pixelInterval: StringSetting;
    };
};

export type VisualizationId = 'line' | 'bar-x' | 'scatter';

export type Visualization = {
    id: VisualizationId;
    placeholders: Placeholder[];
    chartSettings: ChartSettings;
};

export type ExtendedQueryItem = {
    id: string;
    result_count: number;
    annotations?: {
        ui_chart_config: Visualization[];
    };
};
