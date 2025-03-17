import React from 'react';

import {DashKit, PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetBase} from '../components/WidgetBase/WidgetBase';

import {NavigationWidgetContent} from '../Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from '../Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';
import {OperationsWidgetContent} from '../Widgets/Operations/OperationsWidgetContent/OperationsWidgetContent';
import {OperationsWidgetControls} from '../Widgets/Operations/OperationsWidgetControls/OperationsWidgetControls';
import {AccountsWidgetControls} from '../Widgets/Accounts/AccountsWidgetControls/AccountsWidgetControls';
import {AccountsWidgetContent} from '../Widgets/Accounts/AccountsWidgetContent/AccountsWidgetContent';
import {PoolsWidgetContent} from '../Widgets/Pools/PoolsWidgetContent/PoolsWidgetContent';
import {PoolsWidgetControls} from '../Widgets/Pools/PoolsWidgetControls/PoolsWidgetControls';
import {QueriesWidgetControls} from '../Widgets/Queries/QueriesWidgetControls/QueriesWidgetControls';
import {QueriesWidgetContent} from '../Widgets/Queries/QueriesWidgetContent/QueriesWidgetContent';

export function registerPlugins() {
    DashKit.registerPlugins({
        type: 'navigation',
        renderer: function CustomPlugin(props: PluginWidgetProps) {
            return (
                <WidgetBase
                    title="Navigation"
                    type="navigation"
                    controls={<NavigationWidgetControls />}
                    content={<NavigationWidgetContent {...props} />}
                />
            );
        },
    });

    DashKit.registerPlugins({
        type: 'operations',
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

    DashKit.registerPlugins({
        type: 'queries',
        renderer: function CustomPlugin(props: PluginWidgetProps) {
            return (
                <WidgetBase
                    title="Queries"
                    type="queries"
                    controls={<QueriesWidgetControls />}
                    content={<QueriesWidgetContent {...props} />}
                />
            );
        },
    });
}
