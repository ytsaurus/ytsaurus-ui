import React from 'react';

import {DashKit, PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetBase} from '../components/WidgetBase/WidgetBase';

import {NavigationWidgetContent} from '../Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from '../Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';
import {OperationsWidgetContent} from '../Widgets/Operations/OperationsWidgetContent/OperationsWidgetContent';
import {OperationsWidgetControls} from '../Widgets/Operations/OperationsWidgetControls/OperationsWidgetControls';
import {AccountsWidgetContent} from '../Widgets/Accounts/AccountsWidgetContent/AccountsWidgetContent';
import {PoolsWidgetContent} from '../Widgets/Pools/PoolsWidgetContent/PoolsWidgetContent';
import {QueriesWidgetControls} from '../Widgets/Queries/QueriesWidgetControls/QueriesWidgetControls';
import {QueriesWidgetContent} from '../Widgets/Queries/QueriesWidgetContent/QueriesWidgetContent';
import {ServicesWidgetContent} from '../Widgets/Services/ServicesWidgetContent/ServicesWidgetContent';

export function registerPlugins() {
    DashKit.registerPlugins({
        type: 'navigation',
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                title="Navigation"
                type="navigation"
                controls={<NavigationWidgetControls {...props} />}
                content={<NavigationWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'operations',
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                title="Operations"
                type="operations"
                controls={<OperationsWidgetControls {...props} />}
                content={<OperationsWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'accounts',
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                title="Accounts"
                type="accounts"
                content={<AccountsWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'pools',
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                title="Pools"
                type="pools"
                content={<PoolsWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'queries',
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                title="Queries"
                type="queries"
                controls={<QueriesWidgetControls {...props} />}
                content={<QueriesWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'services',
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                title="Serviсes"
                type="services"
                content={<ServicesWidgetContent {...props} />}
            />
        ),
    });
}
