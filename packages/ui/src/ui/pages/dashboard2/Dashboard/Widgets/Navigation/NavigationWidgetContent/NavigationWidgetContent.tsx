import React from 'react';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {useNavigationWidget} from '../hooks/use-navigation-widget';
import type {NavigationWidgetProps} from '../types';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

export function NavigationWidgetContent(props: NavigationWidgetProps) {
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
