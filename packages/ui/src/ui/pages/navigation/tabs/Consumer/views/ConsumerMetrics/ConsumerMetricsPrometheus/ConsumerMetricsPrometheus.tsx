import React from 'react';

import {PrometheusDashboardLazy} from '../../../../../../../containers/PrometheusDashboard/lazy';
import type {UIFactory} from '../../../../../../../UIFactory';

type Props = React.ComponentProps<
    Exclude<ReturnType<UIFactory['getComponentForConsumerMetrics']>, undefined>
>;

export function ConsumerMetricsPrometheus({cluster, path, targetQueue}: Props) {
    const params = React.useMemo(() => {
        const [queue_cluster, ...queue_path] = targetQueue?.split(':') ?? [];
        return !cluster || !path || !queue_cluster || !queue_path.length
            ? undefined
            : {
                  consumer_cluster: cluster,
                  consumer_path: path,
                  queue_cluster,
                  queue_path: queue_path.join(':'),
              };
    }, [cluster, path, targetQueue]);

    return <PrometheusDashboardLazy type="queue-consumer-metrics" params={params} />;
}
