import React from 'react';
import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';
import {getNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

export function NavigationWidgetContent(props: PluginWidgetProps) {
    const type = useSelector((state: RootState) => getNavigationTypeFilter(state, props.id));
    const cluster = useSelector(getCluster);
    const {data: items, isLoading, isFetching} = usePathsQuery({cluster, type});

    return (
        <>
            {isLoading || isFetching ? (
                <WidgetSkeleton itemHeight={30} />
            ) : (
                <NavigationWidgetContentBase pathsType={type} items={items || []} />
            )}
        </>
    );
}
