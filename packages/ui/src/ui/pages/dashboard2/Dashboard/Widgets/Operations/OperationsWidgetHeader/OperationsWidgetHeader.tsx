import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useOperationsWidget} from '../hooks/use-operations-widget';

export function OperationsWidgetHeader(props: PluginWidgetProps) {
    const {
        data: {isLoading, operations},
    } = useOperationsWidget(props);
    const name = props.data?.name as string | undefined;
    const id = props.id;
    return (
        <WidgetHeader
            title={name ?? 'Operations'}
            count={operations?.length}
            isLoading={isLoading}
            page={'OPERATIONS'}
            id={id}
        />
    );
}
