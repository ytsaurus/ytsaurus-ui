import {type ThunkAction} from 'redux-thunk';
import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {type RootState} from '../../../../store/reducers';

export const NODE_RUNNING_JOBS_LOAD_REQUEST = 'NODE_RUNNING_JOBS_LOAD_REQUEST';
export const NODE_RUNNING_JOBS_LOAD_SUCCESS = 'NODE_RUNNING_JOBS_LOAD_SUCCESS';
export const NODE_RUNNING_JOBS_LOAD_FAILURE = 'NODE_RUNNING_JOBS_LOAD_FAILURE';

export type RunningJob = {
    job_id: string;
    operation_id: string;
    job_type:
        | 'map'
        | 'reduce'
        | 'partition_map'
        | 'partition_reduce'
        | 'sorted_merge'
        | 'simple_sort'
        | 'vanilla'
        | string;
    job_phase: string;
    start_time: number;
    initial_resource_demand: {
        vcpu?: number;
        gpu?: number;
        memory?: number;
        system_memory?: number;
        user_memory?: number;
    };
};

type NodeRunningJobsLoadRequestAction = {
    type: typeof NODE_RUNNING_JOBS_LOAD_REQUEST;
};

type NodeRunningJobsLoadSuccessAction = {
    type: typeof NODE_RUNNING_JOBS_LOAD_SUCCESS;
    data: {
        host: string;
        jobs: Array<RunningJob>;
    };
};

type NodeRunningJobsLoadFailureAction = {
    type: typeof NODE_RUNNING_JOBS_LOAD_FAILURE;
    data: {
        error: Error;
    };
};

export type NodeRunningJobsAction =
    | NodeRunningJobsLoadRequestAction
    | NodeRunningJobsLoadSuccessAction
    | NodeRunningJobsLoadFailureAction;

type NodeRunningJobsThunkAction = ThunkAction<
    Promise<void>,
    RootState,
    unknown,
    NodeRunningJobsAction
>;

type RawOrchidJob = {
    operation_id: string;
    job_type: string;
    job_phase: string;
    start_time: number;
    initial_resource_demand?: {
        vcpu?: number;
        gpu?: number;
        memory?: number;
        system_memory?: number;
        user_memory?: number;
    };
};

export function loadNodeRunningJobs(host: string): NodeRunningJobsThunkAction {
    return (dispatch) => {
        dispatch({type: NODE_RUNNING_JOBS_LOAD_REQUEST});

        const orchidPath = `//sys/cluster_nodes/${host}/orchid/exec_node/job_controller/active_jobs`;

        return ytApiV3Id
            .get<Record<string, RawOrchidJob>>(YTApiId.nodeRunningJobs, {
                path: orchidPath,
            })
            .then((activeJobsMap) => {
                const jobs: Array<RunningJob> = Object.entries(activeJobsMap || {}).map(
                    ([jobId, jobData]: [string, RawOrchidJob]) => ({
                        job_id: jobId,
                        operation_id: jobData.operation_id,
                        job_type: jobData.job_type,
                        job_phase: jobData.job_phase,
                        start_time: jobData.start_time,
                        initial_resource_demand: jobData.initial_resource_demand ?? {},
                    }),
                );
                dispatch({
                    type: NODE_RUNNING_JOBS_LOAD_SUCCESS,
                    data: {host, jobs},
                });
            })
            .catch((error: Error) => {
                dispatch({
                    type: NODE_RUNNING_JOBS_LOAD_FAILURE,
                    data: {error},
                });
            });
    };
}
