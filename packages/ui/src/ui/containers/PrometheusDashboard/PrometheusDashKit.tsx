import React from 'react';
import {Config, DashKit, Plugin} from '@gravity-ui/dashkit';
import cn from 'bem-cn-lite';

import {
    DashboardInfo,
    PanelType,
    PanelTypeSpecificProps,
    PluginRenderProps,
    PrometheusDashboardType,
    WidgetType,
} from '../../../shared/prometheus/types';
import {makePanelId} from '../../../shared/prometheus/utils';

import {renderPluginText} from './plugins/text';
import {renderPluginRow} from './plugins/row';
import {renderPluginTimeseries} from './plugins/timeseries';
import {usePrometheusDashboardContext} from './PrometheusDashboardContext/PrometheusDashboardContext';

import {PrometheusDashboardProps} from './PrometheusDashboard';

import './PrometheusDashKit.scss';

const block = cn('yt-prometheus-dashkit');

export type PrometheusDashKitProps = {
    type: PrometheusDashboardType;
    panels?: DashboardInfo['panels'];
    params: Required<PrometheusDashboardProps>['params'];
};

const salt = `${Math.random().toString()}`;

export function PrometheusDashKit({type, panels, params}: PrometheusDashKitProps) {
    const {config} = useDashKitConfig(type, panels, params);
    return (
        <div className={block()}>
            {!config ? null : <DashKit config={config} editMode={false} />}
        </div>
    );
}

function useDashKitConfig(
    dashboardType: PrometheusDashboardType,
    panels: PrometheusDashKitProps['panels'],
    params: Record<string, {toString(): string}>,
) {
    const [collapsedRows, setCollapsedRows] = React.useState<Record<string, boolean | undefined>>(
        {},
    );

    const {expandedId} = usePrometheusDashboardContext();

    const config = React.useMemo(() => {
        let rowSpecificProps: PanelTypeSpecificProps<'row'> | undefined;
        return getVisiblePanels(expandedId, panels).reduce(
            (acc, item) => {
                const {gridPos, type, ...rest} = item;
                const id = makePanelId(item);

                function addToLayout<T>(extraProps: T) {
                    const itemType: WidgetType = `prometheus.${type}`;
                    const data = Object.assign(rest, extraProps, {
                        params: {...params, __ytDashboardType: dashboardType},
                    });
                    acc.layout.push({...gridPos, i: id});
                    acc.items.push({
                        id,
                        type: itemType,
                        namespace: 'default',
                        data,
                    });
                    return data as T;
                }

                if (type === 'row') {
                    const collapsed = collapsedRows[id];
                    rowSpecificProps = addToLayout({
                        childCount: 0,
                        collapsed,
                        onToggleCollapsed: () => {
                            setCollapsedRows({...collapsedRows, [id]: !collapsed});
                        },
                    });
                } else {
                    if (rowSpecificProps?.childCount !== undefined) {
                        ++rowSpecificProps.childCount;
                    }
                    if (!rowSpecificProps?.collapsed) {
                        addToLayout({});
                    }
                }

                return acc;
            },
            {
                salt,
                counter: 0,
                layout: [],
                items: [],
                aliases: {},
                connections: [],
            } as Config,
        );
    }, [panels, collapsedRows, params, expandedId]);

    React.useMemo(() => {
        const widthByY = config?.layout?.reduce(
            (acc, item) => {
                const k = `${item.y}` as const;
                if (acc[k] === undefined) {
                    acc[k] = 0;
                }
                acc[k] += item.w;
                return acc;
            },
            {} as Record<`${number}`, number>,
        );
        const cols = Object.values(widthByY ?? {}).reduce((acc, value) => Math.max(acc, value), 0);

        DashKit.setSettings({
            gridLayout: {
                margin: [4, 4],
                containerPadding: [0, 0],
                rowHeight: 30,
                cols,
            },
        });
    }, [config]);

    return {config};
}

function getVisiblePanels(expandedId?: string, panels: PrometheusDashKitProps['panels'] = []) {
    const expandedPanelIndex = !expandedId
        ? undefined
        : panels?.findIndex((item) => expandedId === makePanelId(item));

    const expandedPanel = expandedPanelIndex ? panels?.[expandedPanelIndex] : undefined;
    if (!expandedPanelIndex || !expandedPanel) {
        return panels;
    }

    return [expandedPanel];
}

const PLUGINS: {
    [K in PanelType]: {
        type: WidgetType<K>;
    } & Plugin<PluginRenderProps<K>>;
} = {
    text: {
        renderer: renderPluginText,
        type: 'prometheus.text',
    },
    timeseries: {
        renderer: renderPluginTimeseries,
        type: 'prometheus.timeseries',
    },
    row: {
        renderer: renderPluginRow,
        type: 'prometheus.row',
    },
};

export type PrometheusPlugins = typeof PLUGINS;

DashKit.registerPlugins(
    ...Object.keys(PLUGINS).map((id) => {
        const k = id as keyof typeof PLUGINS;
        return {...PLUGINS[k]};
    }),
);
