import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {useRouteMatch} from 'react-router';
import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';

import {abortAndReset, loadJobData} from '../../../store/actions/job/general';
import {useUpdater} from '../../../hooks/use-updater';
import {type RouteInfo} from '../../../pages/job/Job';

import {selectCluster} from '../../../store/selectors/global';
import LoadDataHandler from '../../../containers/LoadDataHandler/LoadDataHandler';
import {OperationError} from '../../../containers/OperationError/OperationError';
import JobGeneral from '../JobGeneral/JobGeneral';

import './JobDetails.scss';

const block = cn('job-detail');

export default function JobDetails() {
    const match = useRouteMatch<RouteInfo>();
    const dispatch = useDispatch();

    const {operationID, jobID} = match.params;
    const cluster = useSelector(selectCluster);
    const {loading, loaded, error, errorData} = useSelector((state) => state.job.general);
    const initialLoading = loading && !loaded;

    const {updateFn, destructFn} = useMemo(() => {
        return {
            updateFn: () => dispatch(loadJobData(operationID, jobID)),
            destructFn: () => dispatch(abortAndReset()),
        };
    }, [dispatch, operationID, jobID]);

    useUpdater(updateFn, {destructFn});

    let content: React.ReactNode;
    if (initialLoading) {
        content = <Loader />;
    } else if (error && !loaded && errorData) {
        content = <OperationError error={errorData} cluster={cluster} operationId={operationID} />;
    } else {
        content = (
            <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                <JobGeneral />
            </LoadDataHandler>
        );
    }

    return (
        <ErrorBoundary>
            <div className={block()}>
                <div className={block('content', {loading: initialLoading})}>{content}</div>
            </div>
        </ErrorBoundary>
    );
}
