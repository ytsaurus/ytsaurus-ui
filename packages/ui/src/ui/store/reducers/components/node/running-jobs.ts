import {
    NODE_RUNNING_JOBS_LOAD_FAILURE,
    NODE_RUNNING_JOBS_LOAD_REQUEST,
    NODE_RUNNING_JOBS_LOAD_SUCCESS,
} from '../../../actions/components/node/running-jobs';
import type {
    NodeRunningJobsAction,
    RunningJob,
} from '../../../actions/components/node/running-jobs';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import {type YTError} from '../../../../types';

export type NodeRunningJobsState = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: YTError | undefined;
    host: string | undefined;
    jobs: Array<RunningJob>;
};

const initialState: NodeRunningJobsState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,
    host: undefined,
    jobs: [],
};

function reducer(state = initialState, action: NodeRunningJobsAction): NodeRunningJobsState {
    switch (action.type) {
        case NODE_RUNNING_JOBS_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
                loaded: false,
                jobs: [],
                error: false,
                errorData: undefined,
            };

        case NODE_RUNNING_JOBS_LOAD_SUCCESS: {
            const {host, jobs} = action.data;

            return {
                ...state,
                host,
                jobs,
                loading: false,
                loaded: true,
                error: false,
            };
        }

        case NODE_RUNNING_JOBS_LOAD_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        default:
            return state;
    }
}

const running_jobs = mergeStateOnClusterChange(initialState, {}, reducer);

export default running_jobs;
