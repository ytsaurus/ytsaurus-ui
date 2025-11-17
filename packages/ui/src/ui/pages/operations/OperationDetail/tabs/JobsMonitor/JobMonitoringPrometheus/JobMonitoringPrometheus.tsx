import React from 'react';

import {PrometheusDashboardLazy} from '../../../../../../containers/PrometheusDashboard/lazy';
import {JobMonitoringProps} from '../../../../../../UIFactory';

export function JobMonitoringPrometheus(props: JobMonitoringProps) {
    return <PrometheusDashboardLazy type="job" {...props} />;
}
