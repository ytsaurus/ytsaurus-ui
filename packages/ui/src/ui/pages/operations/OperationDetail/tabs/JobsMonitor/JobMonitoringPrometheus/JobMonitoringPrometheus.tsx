import React from 'react';

import {PrometheusDashboard} from '../../../../../../containers/PrometheusDashboard/PrometheusDashboard';
import {JobMonitoringProps} from '../../../../../../UIFactory';

export function JobMonitoringPrometheus(props: JobMonitoringProps) {
    return <PrometheusDashboard type="job" {...props} />;
}
