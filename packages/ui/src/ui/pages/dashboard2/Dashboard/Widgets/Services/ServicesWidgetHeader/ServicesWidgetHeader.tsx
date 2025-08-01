import React from 'react';

import {WidgetHeader} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetHeader/WidgetHeader';

import {useServicesWidget} from '../hooks/use-services-widget';
import type {ServicesWidgetProps} from '../types';

export function ServicesWidgetHeader(props: ServicesWidgetProps) {
    const {data, isLoading} = useServicesWidget(props);
    const name = props.data?.name as string | undefined;
    const id = props.id;
    return (
        <WidgetHeader
            title={name ?? 'Services'}
            count={data?.length}
            isLoading={isLoading}
            id={id}
        />
    );
}
