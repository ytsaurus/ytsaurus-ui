import React from 'react';

import {PrometheusDashboard} from '../../../../../containers/PrometheusDashboard/PrometheusDashboard';
import {NavigationFlowMonitoringProps} from '../../../../../UIFactory';

export function NavigationFlowMonitoringPrometheus({
    attributes: _a,
    ...params
}: NavigationFlowMonitoringProps) {
    return <PrometheusDashboard type="flow-general" params={params} />;
}
