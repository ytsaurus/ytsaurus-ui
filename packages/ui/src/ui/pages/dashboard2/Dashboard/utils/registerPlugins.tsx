import React from 'react';

import {DashKit, PluginWidgetProps} from '@gravity-ui/dashkit';

import {defaultDashboardItems} from '../../../../constants/dashboard2';

import {WidgetBase} from '../components/WidgetBase/WidgetBase';

import {NavigationWidgetContent} from '../Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from '../Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';
import {NavigationWidgetHeader} from '../Widgets/Navigation/NavigationWidgetHeader/NavigationWidgetHeader';
import {OperationsWidgetContent} from '../Widgets/Operations/OperationsWidgetContent/OperationsWidgetContent';
import {OperationsWidgetControls} from '../Widgets/Operations/OperationsWidgetControls/OperationsWidgetControls';
import {OperationsWidgetHeader} from '../Widgets/Operations/OperationsWidgetHeader/OperationsWidgetHeader';
import {AccountsWidgetContent} from '../Widgets/Accounts/AccountsWidgetContent/AccountsWidgetContent';
import {AccountsWidgetControls} from '../Widgets/Accounts/AccountsWidgetControls/AccountsWidgetControls';
import {AccountsWidgetHeader} from '../Widgets/Accounts/AccountsWidgetHeader/AccountsWidgetHeader';
import {PoolsWidgetContent} from '../Widgets/Pools/PoolsWidgetContent/PoolsWidgetContent';
import {PoolsWidgetControls} from '../Widgets/Pools/PoolsWidgetControls/PoolsWidgetControls';
import {PoolsWidgetHeader} from '../Widgets/Pools/PoolsWidgetHeader/PoolsWidgetHeader';
import {QueriesWidgetControls} from '../Widgets/Queries/QueriesWidgetControls/QueriesWidgetControls';
import {QueriesWidgetContent} from '../Widgets/Queries/QueriesWidgetContent/QueriesWidgetContent';
import {QueriesWidgetHeader} from '../Widgets/Queries/QueriesWidgetHeader/QueriesWidgetHeader';
import {ServicesWidgetContent} from '../Widgets/Services/ServicesWidgetContent/ServicesWidgetContent';
import {ServicesWidgetControls} from '../Widgets/Services/ServicesWidgetControls/ServicesWidgetControls';
import {ServicesWidgetHeader} from '../Widgets/Services/ServicesWidgetHeader/ServicesWidgetHeader';
import type {OperationsWidgetProps} from '../Widgets/Operations/types';

export function registerPlugins() {
    DashKit.setSettings({
        gridLayout: {
            margin: [8, 8],
        },
    });
    DashKit.registerPlugins({
        type: 'navigation',
        defaultLayout: {
            h: defaultDashboardItems['navigation'].layout.h,
            w: defaultDashboardItems['navigation'].layout.w,
            y: Infinity,
        },
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                header={<NavigationWidgetHeader {...props} />}
                controls={<NavigationWidgetControls {...props} />}
                content={<NavigationWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'operations',
        defaultLayout: {
            h: defaultDashboardItems['operations'].layout.h,
            w: defaultDashboardItems['operations'].layout.w,
            y: Infinity,
        },
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                header={<OperationsWidgetHeader {...(props as OperationsWidgetProps)} />}
                controls={<OperationsWidgetControls {...(props as OperationsWidgetProps)} />}
                content={<OperationsWidgetContent {...(props as OperationsWidgetProps)} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'accounts',
        defaultLayout: {
            h: defaultDashboardItems['accounts'].layout.h,
            w: defaultDashboardItems['accounts'].layout.w,
            y: Infinity,
        },
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                content={<AccountsWidgetContent {...props} />}
                controls={<AccountsWidgetControls {...props} />}
                header={<AccountsWidgetHeader {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'pools',
        defaultLayout: {
            h: defaultDashboardItems['pools'].layout.h,
            w: defaultDashboardItems['pools'].layout.w,
            y: Infinity,
        },
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                header={<PoolsWidgetHeader {...props} />}
                content={<PoolsWidgetContent {...props} />}
                controls={<PoolsWidgetControls {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'queries',
        defaultLayout: {
            h: defaultDashboardItems['queries'].layout.h,
            w: defaultDashboardItems['queries'].layout.w,
            y: Infinity,
        },
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                header={<QueriesWidgetHeader {...props} />}
                controls={<QueriesWidgetControls {...props} />}
                content={<QueriesWidgetContent {...props} />}
            />
        ),
    });

    DashKit.registerPlugins({
        type: 'services',
        defaultLayout: {
            h: defaultDashboardItems['services'].layout.h,
            w: defaultDashboardItems['services'].layout.w,
            y: Infinity,
        },
        renderer: (props: PluginWidgetProps) => (
            <WidgetBase
                {...props}
                header={<ServicesWidgetHeader {...props} />}
                content={<ServicesWidgetContent {...props} />}
                controls={<ServicesWidgetControls {...props} />}
            />
        ),
    });
}
