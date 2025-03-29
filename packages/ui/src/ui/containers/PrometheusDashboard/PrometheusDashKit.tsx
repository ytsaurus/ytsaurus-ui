import React from 'react';
import {Config, DashKit, Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import cn from 'bem-cn-lite';

import {DashaboardPanelByType, DashboardInfo} from './PrometheusDashboard';

import './PrometheusDashKit.scss';

const block = cn('yt-prometheus-dashkit');

export type PrometheusDashKitProps = {
    panels?: DashboardInfo['panels'];
};

const salt = `${Math.random().toString()}`;

export function PrometheusDashKit({panels}: PrometheusDashKitProps) {
    const config = React.useMemo(() => {
        return panels?.reduce(
            (acc, item) => {
                const {gridPos, type, ...rest} = item;
                const id = `${type}_${gridPos.x}_${gridPos.y}`;
                const itemType: PluginType = `prometheus.${type}`;
                acc.layout.push({...gridPos, i: id});
                acc.items.push({
                    id,
                    type: itemType,
                    namespace: 'default',
                    data: rest,
                });
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
    }, [panels]);
    return (
        <div className={block()}>
            {!config ? null : <DashKit config={config} editMode={false} />}
        </div>
    );
}

type PanelType = DashaboardPanelByType['type'];

type PluginParams<K extends PanelType> = DashaboardPanelByType & {type: K};
type PluginType<K extends PanelType = PanelType> = `prometheus.${K}`;

const PLUGINS: {
    [K in PanelType]: {
        type: PluginType<K>;
    } & Plugin<PluginWidgetProps<PluginParams<K>>, PluginParams<K>>;
} = {
    text: {
        renderer: (props, ref) => renderPanel<'text'>(props, ref, 'text'),
        type: 'prometheus.text',
    },
    timeseries: {
        renderer: (props, ref) => renderPanel<'timeseries'>(props, ref, 'timeseries'),
        type: 'prometheus.timeseries',
    },
    row: {
        renderer: (props, ref) => renderPanel<'row'>(props, ref, 'row'),
        type: 'prometheus.row',
    },
};

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
    {id}: PluginWidgetProps<PluginParams<K>>,
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
