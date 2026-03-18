import React from 'react';

import {selectCluster} from '../../../../../../store/selectors/global';
import {getPath} from '../../../../../../store/selectors/navigation';
import {useSelector} from '../../../../../../store/redux-hooks';
import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../../components/NoContent';
import UIFactory from '../../../../../../UIFactory';

export default function QueueMetrics() {
    const path = useSelector(getPath);
    const cluster = useSelector(selectCluster);

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
