import React from 'react';

import {PrometheusDashboardLazy} from '../../../../../../../containers/PrometheusDashboard/lazy';
import type {UIFactory} from '../../../../../../../UIFactory';

type Props = React.ComponentProps<
    Exclude<ReturnType<UIFactory['getComponentForConsumerMetrics']>, undefined>
>;

export function QueueMetricsPrometheus({cluster, path}: Props) {
    const params = React.useMemo(() => {
        return !cluster || !path ? undefined : {queue_cluster: cluster, queue_path: path};
    }, [cluster, path]);

    return <PrometheusDashboardLazy type="queue-metrics" params={params} />;
}
