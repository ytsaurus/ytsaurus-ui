import React from 'react';
import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {selectPathsType} from '../../../../../../store/reducers/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';

import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';
import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {Layouts} from '../../../../../../constants/dashboard2';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

const NavigationLayout: LayoutConfig = {
    baseHeight: 5.5,
    defaultHeight: Layouts['navigation'].h,

    rowMultiplier: 0.8,

    minHeight: 5,
    minWidth: 13,
};

export function NavigationWidgetContent(props: PluginWidgetProps) {
    const type = useSelector(selectPathsType);
    const cluster = useSelector(getCluster);
    const {data: items, isLoading} = usePathsQuery({cluster, type});

    //useOnLoadSize(props, NavigationLayout, items?.length || 0);

    return (
        <>
            {isLoading ? (
                <WidgetSkeleton amount={7} itemHeight={30} />
            ) : (
                <NavigationWidgetContentBase items={items} />
            )}
        </>
    );
}
