import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useQueriesWidget} from '../hooks/use-queries-widget';
import {QueriesWidgetProps} from '../types';

export function QueriesWidgetHeader(props: QueriesWidgetProps) {
    const {queries, isLoading} = useQueriesWidget(props);
    const name = props.data?.name as string | undefined;
    const id = props.id;
    return (
        <WidgetHeader
            count={queries?.length}
            title={name ?? 'Queries'}
            page={'QUERIES'}
            isLoading={isLoading}
            id={id}
        />
    );
}
