export type PlaceholderId = 'x' | 'y' | 'colors';

export type Placeholder = {
    id: PlaceholderId;
    field: string;
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
