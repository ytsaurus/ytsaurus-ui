import React from 'react';
import {Config, DashKit, Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import cn from 'bem-cn-lite';

import {
    DashaboardPanelByType,
    DashboardInfo,
    PrometheusDashboardProps,
} from './PrometheusDashboard';

import './PrometheusDashKit.scss';
import {renderPluginText} from './plugins/text';
import {renderPluginRow} from './plugins/row';
import {renderPluginTimeseries} from './plugins/timeseries';

const block = cn('yt-prometheus-dashkit');

export type PrometheusDashKitProps = {
    panels?: DashboardInfo['panels'];
    params: Required<PrometheusDashboardProps>['params'];
};

const salt = `${Math.random().toString()}`;

export function PrometheusDashKit({panels, params}: PrometheusDashKitProps) {
    const {config} = useDashKitConfig(panels, params);
    return (
        <div className={block()}>
            {!config ? null : <DashKit config={config} editMode={false} />}
        </div>
    );
}

function useDashKitConfig(
    panels: PrometheusDashKitProps['panels'],
    params: Record<string, {toString(): string}>,
) {
    const [collapsedRows, setCollapsedRows] = React.useState<Record<string, boolean | undefined>>(
        {},
    );

    React.useMemo(() => {
        DashKit.setSettings({
            gridLayout: {
                margin: [4, 4],
                containerPadding: [0, 0],
                rowHeight: 30,
                cols: 24,
            },
        });
    }, []);

    const config = React.useMemo(() => {
        let rowSpecificProps: PanelTypeSpecificProps<'row'> | undefined;
        return panels?.reduce(
            (acc, item) => {
                const {gridPos, type, ...rest} = item;
                const id = `${type}_${gridPos.x}_${gridPos.y}`;

                function addToLayout<T>(extraProps: T) {
                    const itemType: PluginType = `prometheus.${type}`;
                    const data = Object.assign(rest, extraProps, {params});
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
    }, [panels, collapsedRows, params]);
    return {config};
}

type PanelType = DashaboardPanelByType['type'];
type PanelProps<K extends PanelType> = Omit<DashaboardPanelByType & {type: K}, 'type'> &
    PanelTypeSpecificProps<K>;
export type PluginRenderProps<K extends PanelType> = Omit<PluginWidgetProps, 'data'> & {
    data: PanelProps<K> & {params: Record<string, string | number>};
};

type PanelTypeSpecificProps<K extends PanelType> = K extends 'row'
    ? {collapsed?: boolean; onToggleCollapsed: () => void; childCount: number}
    : {};

type PluginType<K extends PanelType = PanelType> = `prometheus.${K}`;

const PLUGINS: {
    [K in PanelType]: {
        type: PluginType<K>;
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
