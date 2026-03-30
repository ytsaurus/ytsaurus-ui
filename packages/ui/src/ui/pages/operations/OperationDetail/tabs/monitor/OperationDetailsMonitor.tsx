import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {getOperation} from '../../../../../store/selectors/operations/operation';
import {selectCluster} from '../../../../../store/selectors/global';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import {OperationMonitoringTabProps} from '../../../../../UIFactory';

function OperationDetailsMonitor(props: {
    component: React.ComponentType<OperationMonitoringTabProps>;
}) {
    const {component: OperationMonitor} = props;
    const operation = useSelector(getOperation);
    const cluster = useSelector(selectCluster);

    return (
        <ErrorBoundary>
            <OperationMonitor {...{cluster, operation}} />
        </ErrorBoundary>
    );
}

export default React.memo(OperationDetailsMonitor);
