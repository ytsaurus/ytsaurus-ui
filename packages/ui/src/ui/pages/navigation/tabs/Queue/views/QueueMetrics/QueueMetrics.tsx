import React from 'react';

import {getCluster} from '../../../../../../store/selectors/global';
import {getPath} from '../../../../../../store/selectors/navigation';
import {useSelector} from '../../../../../../store/redux-hooks';
import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../../components/NoContent/NoContent';
import UIFactory from '../../../../../../UIFactory';

export default function QueueMetrics() {
    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);

    const MetricsComponent = UIFactory.getComonentForQueueMetrics()!;

    if (!MetricsComponent) {
        return <NoContent warning={'Metrics are not supported for the installation'} />;
    }

    return (
        <ErrorBoundary>
            <MetricsComponent {...{cluster, path}} />
        </ErrorBoundary>
    );
}
