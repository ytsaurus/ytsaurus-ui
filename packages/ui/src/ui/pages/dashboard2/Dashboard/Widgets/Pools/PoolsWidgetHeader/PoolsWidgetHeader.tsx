import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {usePoolsWidget} from '../hooks/use-pools-widget';

export function PoolsWidgetHeader(props: PluginWidgetProps) {
    const {
        data: {pools, isLoading},
    } = usePoolsWidget(props);

    return (
        <WidgetHeader
            title={'Pools'}
            count={pools?.length}
            isLoading={isLoading}
            page={'SCHEDULING'}
        />
    );
}
