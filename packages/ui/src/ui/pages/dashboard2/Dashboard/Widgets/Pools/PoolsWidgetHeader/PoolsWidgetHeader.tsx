import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {usePoolsWidget} from '../hooks/use-pools-widget';

export function PoolsWidgetHeader(props: PluginWidgetProps) {
    const {
        data: {pools, isLoading},
    } = usePoolsWidget(props);
    const name = props.data?.name as string | undefined;
    const id = props.id;
    return (
        <WidgetHeader
            title={name ?? 'Pools'}
            count={pools?.length}
            isLoading={isLoading}
            page={'SCHEDULING'}
            id={id}
        />
    );
}
