import React from 'react';

import {getCluster} from '../../../../../../store/selectors/global';
import {getPath} from '../../../../../../store/selectors/navigation';
import {getTargetQueue} from '../../../../../../store/selectors/navigation/tabs/consumer';
import {useSelector} from 'react-redux';
import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';
import UIFactory from '../../../../../../UIFactory';

export default function ConsumerMetrics() {
    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const targetQueue = useSelector(getTargetQueue);

    const MetricsComponent = UIFactory.getComponentForConsumerMetrics()!;

    return (
        <ErrorBoundary>
            <MetricsComponent {...{cluster, path, targetQueue}} />{' '}
        </ErrorBoundary>
    );
}
