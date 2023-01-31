import React from 'react';
import {useSelector} from 'react-redux';
import _ from 'lodash';

import {getOperation} from '../../../../../store/selectors/operations/operation';
import {getCluster} from '../../../../../store/selectors/global';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import UIFactory from '../../../../../UIFactory';

function OperationDetailsMonitor() {
    const operation = useSelector(getOperation);
    const cluster = useSelector(getCluster);

    const OperationMonitor = UIFactory.getMonitorComponentForOperation()!;

    return (
        <ErrorBoundary>
            <OperationMonitor {...{cluster, operation}} />
        </ErrorBoundary>
    );
}

export default React.memo(OperationDetailsMonitor);
