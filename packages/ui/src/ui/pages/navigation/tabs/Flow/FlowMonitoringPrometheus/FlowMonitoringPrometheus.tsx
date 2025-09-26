import React from 'react';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';
import {NavigationFlowMonitoringProps} from '../../../../../UIFactory';

export function NavigationFlowMonitoringPrometheus({
    attributes: _a,
    ...params
}: NavigationFlowMonitoringProps) {
    return <PrometheusDashboardLazy type="flow-general" params={params} />;
}
