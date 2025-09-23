import type {PluginWidgetProps} from '@gravity-ui/dashkit';

import {YTPermissionType} from '../yt-types';

import type {PrometheusDashboardType} from './dashboard-type';
export {PrometheusDashboardType};

export type DashboardInfo = {
    templating: {
        list: Array<{name: string; default_for_ui?: unknown}>;
        permissions?: Array<PermissionTemplate>;
    };
    panels: Array<DashboardPanel>;
};

export type DashboardPanel = {
    title?: string;
    gridPos: {x: number; y: number; w: number; h: number};
} & DashaboardPanelByType;

/**
 * The strings contain substrings like `$pool`, `$tree` that should be replaced with corresponding parameters
 */
export type StringTemplate = string;

export type PermissionTemplate = {
    permission: YTPermissionType;
    path: StringTemplate;
    cluster?: StringTemplate;
    ignorePaths?: Array<StringTemplate>;
};

export type DashaboardPanelByType =
    | {type: 'row'}
    | {type: 'text'; options: {mode: 'markdown'; content: string}}
    | {type: 'timeseries'; targets: Array<TimeseriesTarget>; title: string};

/**
 * The strings contains substrings like `"$pool"`, `"$tree"` that should be replaced with corresponding parameters
 */
export type PrometheusExpresstionString = string;

export type TimeseriesTarget = {
    expr: PrometheusExpresstionString;
    legendFormat: string;
    refId: string;
};

export type PanelType = DashaboardPanelByType['type'];
export type PanelProps<K extends PanelType> = Omit<DashaboardPanelByType & {type: K}, 'type'> &
    PanelTypeSpecificProps<K>;
export type PanelTypeSpecificProps<K extends PanelType> = K extends 'row'
    ? {collapsed?: boolean; onToggleCollapsed: () => void; childCount: number}
    : {};

export type PrometheusWidgetId = `${number}:${number}:${PanelType}`;
export type WidgetType<K extends PanelType = PanelType> = `prometheus.${K}`;
export type PluginRenderProps<K extends PanelType> = Omit<PluginWidgetProps, 'data' | 'id'> & {
    data: PanelProps<K> & {
        params: PluginRendererDataParams;
    };
    id: PrometheusWidgetId;
};

export type PluginRendererDataParams = Record<string, string | number> & {
    __ytDashboardType: PrometheusDashboardType;
};

export type QueryRangePostData = {
    dashboardType: PrometheusDashboardType;
    id: string | number;
    start: number;
    end: number;
    step: number;
    params: PluginRendererDataParams;
};

export type ChartDataResponse = {
    results: Array<QueryRangeData>;
};

export type QueryRangeData = {
    status: 'success';
    data: {
        resultType: 'matrix';
        result: Array<MetricValues>;
    };
};

export type MetricValues = {
    metric: Record<string, string>;
    values: Array<[number, `${number}`]>;
    legendFormat?: string;
};
