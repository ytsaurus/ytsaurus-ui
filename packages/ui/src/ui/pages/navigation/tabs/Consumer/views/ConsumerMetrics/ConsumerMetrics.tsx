import React from 'react';

import {getCluster} from '../../../../../../store/selectors/global';
import {getPath} from '../../../../../../store/selectors/navigation';
import {getTargetQueue} from '../../../../../../store/selectors/navigation/tabs/consumer';
import {useSelector} from '../../../../../../store/redux-hooks';
import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../../components/NoContent/NoContent';
import UIFactory from '../../../../../../UIFactory';

export default function ConsumerMetrics() {
    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const {queue} = useSelector(getTargetQueue) ?? {};

    const MetricsComponent = UIFactory.getComponentForConsumerMetrics()!;

    if (!MetricsComponent) {
        return <NoContent warning={'Metrics are not supported for the installation'} />;
    }

    if (!queue) {
        return (
            <NoContent
                hint={'Please select a queue'}
                warning={"You don't have any selected queues"}
            />
        );
    }

    return (
        <ErrorBoundary>
            <MetricsComponent {...{cluster, path, targetQueue: queue}} />{' '}
        </ErrorBoundary>
    );
}
