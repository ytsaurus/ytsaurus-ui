import React from 'react';
import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {usePathsQuery} from '../../../../../../store/api/dashboard2/navigation';
import {getPathsType} from '../../../../../../store/selectors/dashboard2/navigation';
import {getCluster} from '../../../../../../store/selectors/global';

import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';
import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';

const OperaionsLayout: LayoutConfig = {
    baseHeight: 4,
    defaultHeight: 14,

    rowMultiplier: 0.8,

    minHeight: 4.5,
    minWidth: 13,
};

export function NavigationWidgetContent(props: PluginWidgetProps) {
    const type = useSelector(getPathsType);
    const cluster = useSelector(getCluster);
    const {data: items, isLoading} = usePathsQuery({cluster, type});
    useOnLoadSize(props, OperaionsLayout, items?.slice(0, 10).length || 0);

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
