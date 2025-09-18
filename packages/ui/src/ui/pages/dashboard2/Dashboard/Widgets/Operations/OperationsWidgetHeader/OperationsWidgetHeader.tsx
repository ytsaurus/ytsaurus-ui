import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useOperationsWidget} from '../hooks/use-operations-widget';
import type {OperationsWidgetProps} from '../types';

import i18n from '../i18n';

export function OperationsWidgetHeader(props: OperationsWidgetProps) {
    const {
        data: {isLoading, operations, requestedOperationsErrors},
    } = useOperationsWidget(props);
    const name = props.data?.name;
    const id = props.id;
    return (
        <WidgetHeader
            title={name ?? i18n('title')}
            count={operations?.length}
            isLoading={isLoading}
            page={'OPERATIONS'}
            id={id}
            error={requestedOperationsErrors}
        />
    );
}
