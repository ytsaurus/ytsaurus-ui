import React from 'react';

import {DashKit, PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetBase} from '../components/WidgetBase/WidgetBase';

import {NavigationWidgetContent} from '../Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from '../Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';
import {OperationsWidgetContent} from '../Widgets/Operations/OperationsWidgetContent/OperationsWidgetContent';
import {OperationsWidgetControls} from '../Widgets/Operations/OperationsWidgetControls/OperationsWidgetControls';

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
}
