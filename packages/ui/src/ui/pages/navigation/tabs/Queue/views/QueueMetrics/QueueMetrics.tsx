import React from 'react';

import {selectCluster} from '../../../../../../store/selectors/global';
import {selectPath} from '../../../../../../store/selectors/navigation';
import {useSelector} from '../../../../../../store/redux-hooks';
import ErrorBoundary from '../../../../../../containers/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../../components/NoContent';
import UIFactory from '../../../../../../UIFactory';
import i18n from './i18n';

export default function QueueMetrics() {
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);

    const MetricsComponent = UIFactory.getComonentForQueueMetrics()!;

    if (!MetricsComponent) {
        return <NoContent warning={i18n('alert_metrics-not-supported')} />;
    }

    return (
        <ErrorBoundary>
            <MetricsComponent {...{cluster, path}} />
        </ErrorBoundary>
    );
}
