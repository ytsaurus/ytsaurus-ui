import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {selectOperation} from '../../../../../store/selectors/operations/operation';
import {selectCluster} from '../../../../../store/selectors/global';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import {type OperationMonitoringTabProps} from '../../../../../UIFactory';

function OperationDetailsMonitor(props: {
    component: React.ComponentType<OperationMonitoringTabProps>;
}) {
    const {component: OperationMonitor} = props;
    const operation = useSelector(selectOperation);
    const cluster = useSelector(selectCluster);

    return (
        <ErrorBoundary>
            <OperationMonitor {...{cluster, operation}} />
        </ErrorBoundary>
    );
}

export default React.memo(OperationDetailsMonitor);
