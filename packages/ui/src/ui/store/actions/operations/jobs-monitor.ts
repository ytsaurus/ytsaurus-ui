import {JOBS_MONITOR} from '../../../constants/operations/detail';
import {ThunkAction} from 'redux-thunk';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import {JobsMonitorAction} from '../../../store/reducers/operations/jobs/jobs-monitor';
import {getOperationMonitoredJobCount} from '../../../store/selectors/operations/operation';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';

type JobsMonitorThunkAction = ThunkAction<unknown, RootState, unknown, JobsMonitorAction>;

const cancelHelper = new CancelHelper();

export function getJobsMonitoringDescriptors(operation_id: string): JobsMonitorThunkAction {
    return (dispatch, getState) => {
        const jobsCount = getOperationMonitoredJobCount(getState());
        if (jobsCount === 0) {
            return undefined;
        }

        dispatch({type: JOBS_MONITOR.REQUEST});

        return ytApiV3Id
            .listJobs(YTApiId.listJobs100, {
                parameters: {
                    operation_id,
                    sort_field: 'start_time',
                    sort_order: 'descending',
                    attributes: ['monitoring_descriptor', 'start_time', 'finish_time'],
                    with_monitoring_descriptor: true,
                },
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(({jobs}) => {
                dispatch({type: JOBS_MONITOR.SUCCESS, data: {jobs, operation_id}});
            })
            .catch((error) => {
                if (isCancelled(error)) {
                    dispatch({type: JOBS_MONITOR.CANCELLED});
                    return;
                }

                dispatch({type: JOBS_MONITOR.FAILURE, data: {error}});
            });
    };
}
