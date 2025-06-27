import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useServicesWidget} from '../hooks/use-services-widget';

export function ServicesWidgetHeader(props: PluginWidgetProps) {
    const {data, isLoading} = useServicesWidget(props);

    return <WidgetHeader title={'Services'} count={data?.length} isLoading={isLoading} />;
}
