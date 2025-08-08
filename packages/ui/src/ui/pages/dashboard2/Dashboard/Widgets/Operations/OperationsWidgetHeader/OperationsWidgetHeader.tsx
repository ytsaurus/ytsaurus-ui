import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useOperationsWidget} from '../hooks/use-operations-widget';
import type {OperationsWidgetProps} from '../types';

export function OperationsWidgetHeader(props: OperationsWidgetProps) {
    const {
        data: {isLoading, operations},
    } = useOperationsWidget(props);
    const name = props.data?.name;
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
