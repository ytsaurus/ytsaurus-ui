import {JOBS_MONITOR} from '../../../../constants/operations/detail';
import {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import {ActionD, YTError} from '../../../../types';

export interface JobItem {
    id: string;
    monitoring_descriptor?: string;
    start_time?: string;
    finish_time?: string;
}

export interface JobsMonitorState {
    loaded: boolean;
    loading: boolean;

    error: YTError | undefined;

    operation_id: string;
    jobs: Array<JobItem>;
}

const initialState: JobsMonitorState = {
    loaded: false,
    loading: false,
    error: undefined,
    operation_id: '',
    jobs: [],
};

function reducer(state = initialState, action: JobsMonitorAction) {
    switch (action.type) {
        case JOBS_MONITOR.REQUEST:
            return {...state, loading: true};
        case JOBS_MONITOR.CANCELLED:
            return {...state, loading: false};
        case JOBS_MONITOR.FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
        case JOBS_MONITOR.SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true, error: undefined};
        default:
            return state;
    }
}

export type JobsMonitorAction =
    | Action<typeof JOBS_MONITOR.REQUEST>
    | Action<typeof JOBS_MONITOR.CANCELLED>
    | ActionD<typeof JOBS_MONITOR.SUCCESS, Pick<JobsMonitorState, 'jobs' | 'operation_id'>>
    | ActionD<typeof JOBS_MONITOR.FAILURE, Pick<JobsMonitorState, 'error'>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
