import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useNavigationWidget} from '../hooks/use-navigation-widget';

export function NavigationWidgetHeader(props: PluginWidgetProps) {
    const {items, isLoading} = useNavigationWidget(props);
    return (
        <WidgetHeader
            title={'Navigation'}
            isLoading={isLoading}
            count={items?.length}
            page={'NAVIGATION'}
        />
    );
}
