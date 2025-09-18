import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useQueriesWidget} from '../hooks/use-queries-widget';
import {QueriesWidgetProps} from '../types';

import i18n from '../i18n';

export function QueriesWidgetHeader(props: QueriesWidgetProps) {
    const {queries, isLoading, requestedQueriesErrors} = useQueriesWidget(props);
    const name = props.data?.name as string | undefined;
    const id = props.id;
    return (
        <WidgetHeader
            count={queries?.length}
            title={name ?? i18n('title')}
            page={'QUERIES'}
            isLoading={isLoading}
            id={id}
            error={requestedQueriesErrors}
        />
    );
}
