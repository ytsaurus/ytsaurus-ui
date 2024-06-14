import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getJobs} from '../../../../../store/actions/operations/jobs';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../../../components/LoadDataHandler/LoadDataHandler';
import OperationJobsTable from './OperationJobsTable/OperationJobsTable';
import OperationJobsToolbar from './OperationJobsToolbar/OperationJobsToolbar';

import {useUpdater} from '../../../../../hooks/use-updater';
import {
    getOperationDetailsLoadingStatus,
    getOperationJobsLoadingStatus,
} from '../../../../../store/selectors/operations/operation';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import OperationJobsErrors from './OperationJobsErrors/OperationJobsErrors';

function Jobs({className}) {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.operations.jobs.loading);
    const loaded = useSelector((state) => state.operations.jobs.loaded);
    const error = useSelector((state) => state.operations.jobs.error);
    const errorData = useSelector((state) => state.operations.jobs.errorData);

    const updateFn = React.useCallback(() => {
        dispatch(getJobs());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: 15 * 1000});

    const isLoading = loading && !loaded;
    return (
        <ErrorBoundary>
            <div className={`operation-detail-jobs ${className}`}>
                <OperationJobsToolbar />
                <LoadDataHandler {...{loaded, loading, error, errorData}} alwaysShowError>
                    <OperationJobsErrors />
                    <OperationJobsTable isLoading={isLoading} />
                </LoadDataHandler>
            </div>
        </ErrorBoundary>
    );
}

export default function JobsWithRum(props) {
    const loadState = useSelector(getOperationJobsLoadingStatus);
    /**
     * Selection of this value involves additional rerenders of the component
     * but without it RUM-measures will be wrongly too big it.
     * OperationDetail cannot stop measure for RumMeasureTypes.OPERATION by self,
     * it must be done by nesting tab-content.
     */
    const operationLoadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_JOBS,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState, operationLoadState],
        allowStart: ([loadState, operationLoadState]) => {
            return !isFinalLoadingStatus(loadState) || !isFinalLoadingStatus(operationLoadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_JOBS,
        stopDeps: [loadState, operationLoadState],
        allowStop: ([loadState, operationLoadState]) => {
            return isFinalLoadingStatus(loadState) && isFinalLoadingStatus(operationLoadState);
        },
    });

    return <Jobs {...props} />;
}
