import React from 'react';

import {getCluster} from '../../../../../../store/selectors/global';
import {getPath} from '../../../../../../store/selectors/navigation';
import {useSelector} from '../../../../../../store/redux-hooks';
import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';
import UIFactory from '../../../../../../UIFactory';

export default function QueueMetrics() {
    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);

    const MetricsComponent = UIFactory.getComonentForQueueMetrics()!;

    return (
        <ErrorBoundary>
            <MetricsComponent {...{cluster, path}} />
        </ErrorBoundary>
    );
}
