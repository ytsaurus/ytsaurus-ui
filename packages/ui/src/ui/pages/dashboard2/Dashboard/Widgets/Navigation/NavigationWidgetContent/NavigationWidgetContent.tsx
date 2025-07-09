import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {useNavigationWidget} from '../hooks/use-navigation-widget';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

export function NavigationWidgetContent(props: PluginWidgetProps) {
    const {type, items, isLoading, error} = useNavigationWidget(props);

    return (
        <>
            {isLoading ? (
                <WidgetSkeleton itemHeight={30} />
            ) : (
                <NavigationWidgetContentBase pathsType={type} items={items || []} error={error} />
            )}
        </>
    );
}
