import type {PluginWidgetProps} from '@gravity-ui/dashkit';

export type DashboardInfo = {
    templating: {list: Array<{name: string}>};
    panels: Array<DashboardPanel>;
};

export type DashboardPanel = {
    title?: string;
    gridPos: {x: number; y: number; w: number; h: number};
} & DashaboardPanelByType;

export type DashaboardPanelByType =
    | {type: 'row'}
    | {type: 'text'; options: {mode: 'markdown'; content: string}}
    | {type: 'timeseries'; targets: Array<TimeseriesTarget>; title: string};

export type TimeseriesTarget = {expr: string; legendFormat: string; refId: string};

export type PanelType = DashaboardPanelByType['type'];
export type PanelProps<K extends PanelType> = Omit<DashaboardPanelByType & {type: K}, 'type'> &
    PanelTypeSpecificProps<K>;
export type PanelTypeSpecificProps<K extends PanelType> = K extends 'row'
    ? {collapsed?: boolean; onToggleCollapsed: () => void; childCount: number}
    : {};

export type PrometheusWidgetId = `${PanelType}_${number}_${number}`;
export type WidgetType<K extends PanelType = PanelType> = `prometheus.${K}`;
export type PluginRenderProps<K extends PanelType> = Omit<PluginWidgetProps, 'data' | 'id'> & {
    data: PanelProps<K> & {params: Record<string, string | number>};
    id: PrometheusWidgetId;
};
