import React from 'react';

import {selectCluster} from '../../../../../../store/selectors/global';
import {selectPath} from '../../../../../../store/selectors/navigation';
import {selectTargetQueue} from '../../../../../../store/selectors/navigation/tabs/consumer';
import {useSelector} from '../../../../../../store/redux-hooks';
import ErrorBoundary from '../../../../../../containers/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../../components/NoContent';
import UIFactory from '../../../../../../UIFactory';
import i18n from './i18n';

export default function ConsumerMetrics() {
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);
    const {queue} = useSelector(selectTargetQueue) ?? {};

    const MetricsComponent = UIFactory.getComponentForConsumerMetrics()!;

    if (!MetricsComponent) {
        return <NoContent warning={i18n('alert_metrics-not-supported')} />;
    }

    if (!queue) {
        return (
            <NoContent
                hint={i18n('context_select-queue')}
                warning={i18n('alert_no-selected-queues')}
            />
        );
    }

    return (
        <ErrorBoundary>
            <MetricsComponent {...{cluster, path, targetQueue: queue}} />{' '}
        </ErrorBoundary>
    );
}
