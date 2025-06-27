import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useOperationsWidget} from '../hooks/use-operations-widget';

export function OperationsWidgetHeader(props: PluginWidgetProps) {
    const {
        data: {isLoading, operations},
    } = useOperationsWidget(props);

    return (
        <WidgetHeader
            title={'Operations'}
            count={operations?.length}
            isLoading={isLoading}
            page={'OPERATIONS'}
        />
    );
}
