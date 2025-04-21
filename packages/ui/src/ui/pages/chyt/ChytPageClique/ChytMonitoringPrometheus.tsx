import React from 'react';

import {PrometheusDashboardLazy} from '../../../containers/PrometheusDashboard/lazy';
import type {ChytMonitoringProps} from '../../../UIFactory';

export function ChytMonitoringPrometheus({cluster, alias}: ChytMonitoringProps) {
    const params = React.useMemo(() => {
        return !cluster || !alias ? undefined : {cluster, alias};
    }, [cluster, alias]);

    return <PrometheusDashboardLazy type="chyt-monitoring" params={params} />;
}
