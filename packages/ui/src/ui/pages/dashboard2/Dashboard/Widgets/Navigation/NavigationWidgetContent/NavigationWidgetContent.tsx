import React from 'react';
import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getPathsType} from '../../../../../../store/reducers/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';
import {useAutoHeight} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-autoheight';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

// 1 react-grid height value ~ 25.3px
const navigationLayout = {
    baseHeight: 3,
    defaultHeight: 12,
    rowHeight: 1.2,
    minWidth: 10,
};

export function NavigationWidgetContent(props: PluginWidgetProps) {
    const type = useSelector((state: RootState) => getPathsType(state, props.id));
    const cluster = useSelector(getCluster);
    const {data: items, isLoading} = usePathsQuery({cluster, type});

    useAutoHeight(props, navigationLayout, items?.length || 0);

    return (
        <>
            {isLoading ? (
                <WidgetSkeleton itemHeight={30} />
            ) : (
                <NavigationWidgetContentBase items={items || []} />
            )}
        </>
    );
}
