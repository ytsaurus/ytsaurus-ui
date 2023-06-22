import {useDispatch, useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router';
import React, {useEffect} from 'react';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import JobGeneral from '../../../pages/job/JobGeneral/JobGeneral';
import {Loader} from '@gravity-ui/uikit';

import {abortAndReset, loadJobData} from '../../../store/actions/job/general';
import Updater from '../../../utils/hammer/updater';
import {RootState} from '../../../store/reducers';
import {RouteInfo} from '../../../pages/job/Job';

import './JobDetails.scss';

const block = cn('job-detail');
const updater = new Updater();

export default function JobDetails() {
    const match = useRouteMatch<RouteInfo>();
    const dispatch = useDispatch();

    const {operationID, jobID} = match.params;
    const {loading, loaded, error, errorData} = useSelector(
        (state: RootState) => state.job.general,
    );
    const initialLoading = loading && !loaded;

    useEffect(() => {
        const loadHandler = () => dispatch(loadJobData(operationID, jobID));
        updater.add('job', loadHandler, 30 * 1000);

        return () => {
            updater.remove('job');
            dispatch(abortAndReset());
        };
    }, [dispatch, operationID, jobID]);

    return (
        <ErrorBoundary>
            <div className={block()}>
                <div className={block('content', {loading: initialLoading})}>
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                            <JobGeneral />
                        </LoadDataHandler>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
