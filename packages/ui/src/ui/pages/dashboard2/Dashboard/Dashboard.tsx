import React from 'react';
import {useSelector} from 'react-redux';
import {Lang, configure} from '@gravity-ui/uikit';
import {
    DashKit,
    DashKitDnDWrapper,
    DashKitProps,
    ItemDropProps,
    PluginWidgetProps,
} from '@gravity-ui/dashkit';

import {getIsEditing} from '../../../store/selectors/dashboard2';

import {WidgetBase} from './WidgetBase/WidgetBase';
import {NavigationWidgetContent} from './Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from './Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';
import {OperationsWidgetContent} from './Widgets/Operations/OperationsWidgetContent/OperationsWidgetContent';
import {OperationsWidgetControls} from './Widgets/Operations/OperationsWidgetControls/OperationsWidgetControls';
import {AccountsWidgetControls} from './Widgets/Accounts/AccountsWidgetControls/AccountsWidgetControls';
import {AccountsWidgetContent} from './Widgets/Accounts/AccountsWidgetContent/AccountsWidgetContent';
import {PoolsWidgetContent} from './Widgets/Pools/PoolsWidgetContent/PoolsWidgetContent';
import {PoolsWidgetControls} from './Widgets/Pools/PoolsWidgetControls/PoolsWidgetControls';

configure({lang: Lang.En});

DashKit.setSettings({
    gridLayout: {margin: [8, 8]},
});

DashKit.registerPlugins({
    type: 'navigation',
    defaultLayout: {
        h: 13,
        w: 13,
        minH: 6,
        minW: 11,
        maxH: 15.5,
        maxW: 16,
    },
    renderer: function CustomPlugin(props: PluginWidgetProps) {
        return (
            <WidgetBase
                title="Navigation"
                type="navigation"
                controls={<NavigationWidgetControls />}
                content={<NavigationWidgetContent />}
            />
        );
    },
});

DashKit.registerPlugins({
    type: 'operations',
    defaultLayout: {
        h: 13,
        w: 23,
        minH: 8,
        minW: 13,
        maxH: 20,
        maxW: 22,
    },
    renderer: function CustomPlugin(props: PluginWidgetProps) {
        return (
            <WidgetBase
                title="Operations"
                type="operations"
                controls={<OperationsWidgetControls />}
                content={<OperationsWidgetContent {...props} />}
            />
        );
    },
});

DashKit.registerPlugins({
    type: 'accounts',
    defaultLayout: {
        h: 13,
        w: 23,
        minH: 8,
        minW: 13,
        maxH: 20,
        maxW: 22,
    },
    renderer: function CustomPlugin(props: PluginWidgetProps) {
        return (
            <WidgetBase
                title="Accounts"
                type="accounts"
                controls={<AccountsWidgetControls />}
                content={<AccountsWidgetContent {...props} />}
            />
        );
    },
});

DashKit.registerPlugins({
    type: 'pools',
    defaultLayout: {
        h: 13,
        w: 23,
        minH: 8,
        minW: 13,
        maxH: 20,
        maxW: 22,
    },
    renderer: function CustomPlugin(props: PluginWidgetProps) {
        return (
            <WidgetBase
                title="Pools"
                type="pools"
                controls={<PoolsWidgetControls />}
                content={<PoolsWidgetContent {...props} />}
            />
        );
    },
});

export const config: DashKitProps['config'] = {
    salt: '0.46703554571365613',
    counter: 3,
    items: [
        {
            id: 'zR',
            data: {
                text: '### Text',
            },
            type: 'navigation',
            namespace: 'default',
            orderId: 0,
        },
        {
            id: 'Dk',
            data: {
                foo: 'bar',
            },
            type: 'operations',
            namespace: 'default',
            orderId: 1,
        },
        {
            id: 'As',
            data: {
                foo: 'bar',
            },
            type: 'accounts',
            namespace: 'default',
            orderId: 2,
        },
        {
            id: 'Qs',
            data: {
                foo: 'bar',
            },
            type: 'pools',
            namespace: 'default',
            orderId: 3,
        },
    ],
    layout: [
        {
            h: 12,
            i: 'zR',
            w: 13,
            x: 0,
            y: 0,
        },
        {
            h: 12,
            i: 'Dk',
            w: 23,
            x: 13,
            y: 0,
        },
        {
            h: 12,
            i: 'As',
            w: 18,
            x: 18,
            y: 0,
        },
        {
            h: 12,
            i: 'Qs',
            w: 18,
            x: 0,
            y: 1,
        },
    ],
    aliases: {},
    connections: [],
};

export function Dashboard() {
    const isEditing = useSelector(getIsEditing);

    const onDrop = (dropProps: ItemDropProps) => {
        dropProps.commit();
    };

    return (
        <div style={{margin: '8px'}}>
            <DashKitDnDWrapper>
                <DashKit
                    editMode={isEditing}
                    config={config || {}}
                    onChange={(dash) => {
                        //console.log(dash.config.layout);
                    }}
                    onDrop={onDrop}
                />
            </DashKitDnDWrapper>
        </div>
    );
}
