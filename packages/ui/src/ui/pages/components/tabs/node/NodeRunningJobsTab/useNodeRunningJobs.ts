import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {loadNodeRunningJobs} from '../../../../../store/actions/components/node/running-jobs';
import {
    selectNodeRunningJobsError,
    selectNodeRunningJobsErrorData,
    selectNodeRunningJobsJobs,
    selectNodeRunningJobsLoaded,
    selectNodeRunningJobsLoading,
} from '../../../../../store/selectors/components/node/running-jobs';
import {useUpdater} from '../../../../../hooks/use-updater';

export function useNodeRunningJobs(host: string | undefined) {
    const dispatch = useDispatch();

    const jobs = useSelector(selectNodeRunningJobsJobs);
    const loading = useSelector(selectNodeRunningJobsLoading);
    const loaded = useSelector(selectNodeRunningJobsLoaded);
    const error = useSelector(selectNodeRunningJobsError);
    const errorData = useSelector(selectNodeRunningJobsErrorData);

    const refresh = React.useCallback(() => {
        if (host) {
            dispatch(loadNodeRunningJobs(host));
        }
    }, [dispatch, host]);

    useUpdater(refresh);

    return {
        jobs,
        loading,
        loaded,
        error,
        errorData,
        refresh,
    };
}
