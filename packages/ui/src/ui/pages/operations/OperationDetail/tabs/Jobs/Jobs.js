import React from 'react';
import PropTypes from 'prop-types';
import {connect, useSelector} from 'react-redux';

import {getJobs} from '../../../../../store/actions/operations/jobs';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../../../components/LoadDataHandler/LoadDataHandler';
import OperationJobsTable from './OperationJobsTable/OperationJobsTable';
import OperationJobsToolbar from './OperationJobsToolbar/OperationJobsToolbar';

import Updater from '../../../../../utils/hammer/updater';
import {POLLING_INTERVAL} from '../../../../../constants/operations/detail';
import {
    getOperationJobsLoadingStatus,
    getOperationDetailsLoadingStatus,
} from '../../../../../store/selectors/operations/operation';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import OperationJobsErrors from './OperationJobsErrors/OperationJobsErrors';

const updater = new Updater();

const OPERATION_JOBS_UPDATE_ID = 'operation.jobs';

class Jobs extends React.Component {
    static propTypes = {
        // from connect
        getJobs: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,
    };

    componentDidMount() {
        const {getJobs} = this.props;

        updater.add(OPERATION_JOBS_UPDATE_ID, getJobs, POLLING_INTERVAL);
    }

    componentWillUnmount() {
        updater.remove(OPERATION_JOBS_UPDATE_ID);
    }

    render() {
        const {loading, loaded} = this.props;
        const isLoading = loading && !loaded;
        return (
            <ErrorBoundary>
                <div className="operation-detail-jobs">
                    <OperationJobsToolbar />
                    <LoadDataHandler {...this.props} alwaysShowError>
                        <OperationJobsErrors />
                        <OperationJobsTable isLoading={isLoading} />
                    </LoadDataHandler>
                </div>
            </ErrorBoundary>
        );
    }
}

function mapStateToProps({operations}) {
    const {loading, loaded, error, errorData} = operations.jobs;

    return {loading, loaded, error, errorData};
}

const mapDispatchToProps = {
    getJobs,
};

const JobsConnected = connect(mapStateToProps, mapDispatchToProps)(Jobs);

export default function JobsWithRum() {
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

    return <JobsConnected />;
}
