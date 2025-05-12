import React from 'react';

import {DashKit, PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetBase} from '../components/WidgetBase/WidgetBase';

import {NavigationWidgetContent} from '../Widgets/Navigation/NavigationWidgetContent/NavigationWidgetContent';
import {NavigationWidgetControls} from '../Widgets/Navigation/NavigationWidgetControls/NavigationWidgetControls';

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
}
