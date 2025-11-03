import {useDispatch, useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router';
import React from 'react';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import JobGeneral from '../../../pages/job/JobGeneral/JobGeneral';
import {Flex, Loader} from '@gravity-ui/uikit';

import {abortAndReset, loadJobData} from '../../../store/actions/job/general';
import {useUpdater} from '../../../hooks/use-updater';
import {RootState} from '../../../store/reducers';
import {RouteInfo} from '../../../pages/job/Job';

import './JobDetails.scss';

const block = cn('job-detail');

export default function JobDetails() {
    const match = useRouteMatch<RouteInfo>();
    const dispatch = useDispatch();

    const {operationID, jobID} = match.params;
    const {loading, loaded, error, errorData} = useSelector(
        (state: RootState) => state.job.general,
    );
    const initialLoading = loading && !loaded;

    const {updateFn, destructFn} = React.useMemo(() => {
        return {
            updateFn: () => dispatch(loadJobData(operationID, jobID)),
            destructFn: () => dispatch(abortAndReset()),
        };
    }, [dispatch, operationID, jobID]);

    useUpdater(updateFn, {destructFn});

    return (
        <ErrorBoundary>
            <div className={block()}>
                <Flex grow={1} className={block('content', {loading: initialLoading})}>
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                            <JobGeneral />
                        </LoadDataHandler>
                    )}
                </Flex>
            </div>
        </ErrorBoundary>
    );
}
