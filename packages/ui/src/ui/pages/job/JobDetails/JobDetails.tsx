import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {useRouteMatch} from 'react-router';
import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../containers/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import JobGeneral from '../../../pages/job/JobGeneral/JobGeneral';
import {Loader} from '@gravity-ui/uikit';
import {RoutedButton} from '../../../containers/RoutedButton/RoutedButton';
import {PrettyError} from '../../../containers/PrettyError';
import {type ErrorsInfoMap, determineErrorCode} from '../../../containers/PrettyError/helpers';

import {abortAndReset, loadJobData} from '../../../store/actions/job/general';
import {selectCluster} from '../../../store/selectors/global';
import {useUpdater} from '../../../hooks/use-updater';
import {type RootState} from '../../../store/reducers';
import {type RouteInfo} from '../../../pages/job/Job';
import {makeOperationJobsUrl, makeOperationsUrl} from '../../../utils/app-url';
import i18n from './i18n';

import './JobDetails.scss';

const block = cn('job-detail');

const ErrorsInfo: ErrorsInfoMap = {
    1915: {
        getTitle: () => i18n('alert_operation-not-found'),
    },
    1916: {
        getTitle: () => i18n('alert_job-or-operation-not-found'),
    },
};

export default function JobDetails() {
    const match = useRouteMatch<RouteInfo>();
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);

    const {operationID, jobID} = match.params;
    const {loading, loaded, error, errorData} = useSelector(
        (state: RootState) => state.job.general,
    );
    const initialLoading = loading && !loaded;

    const {updateFn, destructFn} = useMemo(() => {
        return {
            updateFn: () => dispatch(loadJobData(operationID, jobID)),
            destructFn: () => dispatch(abortAndReset()),
        };
    }, [dispatch, operationID, jobID]);

    useUpdater(updateFn, {destructFn});

    function renderContent() {
        if (initialLoading) {
            return <Loader />;
        }

        if (error && !loaded && errorData) {
            const errorCode = determineErrorCode(errorData, ErrorsInfo);

            if (errorCode) {
                const operationNotFound = errorCode === 1915;

                return (
                    <PrettyError
                        error={errorData}
                        errorCode={errorCode}
                        errorsInfo={ErrorsInfo}
                        renderActions={() => (
                            <RoutedButton
                                view="outlined"
                                href={
                                    operationNotFound
                                        ? makeOperationsUrl({cluster})
                                        : makeOperationJobsUrl({cluster, operationId: operationID})
                                }
                            >
                                {operationNotFound
                                    ? i18n('action_go-to-operations')
                                    : i18n('action_go-to-jobs')}
                            </RoutedButton>
                        )}
                    />
                );
            }
        }

        return (
            <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                <JobGeneral />
            </LoadDataHandler>
        );
    }

    return (
        <ErrorBoundary>
            <div className={block()}>
                <div className={block('content', {loading: initialLoading})}>{renderContent()}</div>
            </div>
        </ErrorBoundary>
    );
}
