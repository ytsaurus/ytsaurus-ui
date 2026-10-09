import React from 'react';
import {parseQueueRegistrationPath} from '../../../../../../../utils/navigation/queue-registration';

import {PrometheusDashboardLazy} from '../../../../../../../containers/PrometheusDashboard/lazy';
import {type UIFactory} from '../../../../../../../UIFactory';

type Props = React.ComponentProps<
    Exclude<ReturnType<UIFactory['getComponentForConsumerMetrics']>, undefined>
>;

export function ConsumerMetricsPrometheus({cluster, path, targetQueue, consumerName}: Props) {
    const params = React.useMemo(() => {
        const {cluster: queue_cluster, path: queue_path} = parseQueueRegistrationPath(
            targetQueue ?? '',
        );
        return !cluster || !path || !queue_cluster || !queue_path
            ? undefined
            : {
                  consumer_cluster: cluster,
                  consumer_path: path,
                  queue_cluster,
                  queue_path,
                  ...(consumerName === undefined ? {} : {consumer_name: consumerName}),
              };
    }, [cluster, path, targetQueue, consumerName]);

    return <PrometheusDashboardLazy type="queue-consumer-metrics" params={params} />;
}
