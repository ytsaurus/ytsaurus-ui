import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useQueriesWidget} from '../hooks/use-queries-widget';

export function QueriesWidgetHeader(props: PluginWidgetProps) {
    const {queries, isLoading} = useQueriesWidget(props);

    return (
        <WidgetHeader
            count={queries?.length}
            title={'Queries'}
            page={'QUERIES'}
            isLoading={isLoading}
        />
    );
}
