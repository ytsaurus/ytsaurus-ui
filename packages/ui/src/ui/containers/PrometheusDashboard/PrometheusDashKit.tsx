import React from 'react';
import {Config, DashKit, Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import cn from 'bem-cn-lite';

import {DashaboardPanelByType, DashboardInfo} from './PrometheusDashboard';

import './PrometheusDashKit.scss';
import {renderPluginText} from './plugins/text';
import {renderPluginRow} from './plugins/row';

const block = cn('yt-prometheus-dashkit');

export type PrometheusDashKitProps = {
    panels?: DashboardInfo['panels'];
};

const salt = `${Math.random().toString()}`;

export function PrometheusDashKit({panels}: PrometheusDashKitProps) {
    const {config} = useDashKitConfig(panels);
    return (
        <div className={block()}>
            {!config ? null : <DashKit config={config} editMode={false} />}
        </div>
    );
}

function useDashKitConfig(panels: PrometheusDashKitProps['panels']) {
    const [collapsedRows, setCollapsedRows] = React.useState<Record<string, boolean | undefined>>(
        {},
    );

    const config = React.useMemo(() => {
        let rowSpecificProps: PanelTypeSpecificProps<'row'> | undefined;
        return panels?.reduce(
            (acc, item) => {
                const {gridPos, type, ...rest} = item;
                const id = `${type}_${gridPos.x}_${gridPos.y}`;

                function addToLayout<T>(extraProps: T) {
                    const itemType: PluginType = `prometheus.${type}`;
                    const data = Object.assign(rest, extraProps);
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
    }, [panels, collapsedRows]);
    return {config};
}

type PanelType = DashaboardPanelByType['type'];
type PanelProps<K extends PanelType> = Omit<DashaboardPanelByType & {type: K}, 'type'> &
    PanelTypeSpecificProps<K>;
export type PluginRenderProps<K extends PanelType> = Omit<PluginWidgetProps, 'data'> & {
    data: PanelProps<K>;
};

type PanelTypeSpecificProps<K extends PanelType> = K extends 'row'
    ? {collapsed?: boolean; onToggleCollapsed: () => void; childCount: number}
    : never;

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
        renderer: (props, ref) => renderPanel(props, ref, 'timeseries'),
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
        return {...PLUGINS[k], defaultLayout: {w: 10, h: 10}};
    }),
);

DashKit.setSettings({
    gridLayout: {
        margin: [4, 4],
        containerPadding: [0, 0],
        rowHeight: 25,
        cols: 24,
    },
});

function renderPanel<K extends PanelType>(
    {id}: PluginRenderProps<K>,
    forwardRef: React.Ref<any>,
    type: K,
) {
    return (
        <div
            ref={forwardRef}
            style={{
                overflow: 'auto',
                backgroundColor: 'lightgray',
                width: '100%',
                height: '100%',
            }}
        >
            {JSON.stringify({type, id})}
        </div>
    );
}
