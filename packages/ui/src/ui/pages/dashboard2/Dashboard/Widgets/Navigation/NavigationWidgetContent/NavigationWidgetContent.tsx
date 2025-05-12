import React from 'react';
import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getPathsType} from '../../../../../../store/reducers/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

export function NavigationWidgetContent(props: PluginWidgetProps) {
    const type = useSelector((state: RootState) => getPathsType(state, props.id));
    const cluster = useSelector(getCluster);
    const {data: items, isLoading} = usePathsQuery({cluster, type});

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
