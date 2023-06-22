import {
    CONSUMER_STATUS_LOAD_FAILURE,
    CONSUMER_STATUS_LOAD_REQUEST,
    CONSUMER_STATUS_LOAD_SUCCESS,
} from '../../../../../constants/navigation/tabs/consumer';
import type {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD, YTError} from '../../../../../types';
import {TPerformanceCounters} from '../queue/types';

export interface YtConsumerStatus {
    error?: YTError; // may be missing
    // All attributes below are missing if error is not null.
    target_queue: string;
    vital: boolean;
    owner: string; // Always username.
    partition_count: number;
    read_data_weight_rate: TPerformanceCounters; // (unimplemented)
    read_row_count_rate: TPerformanceCounters; // (unimplemented)
}

export interface ConsumerQueueInfo {
    queue: string;
    vital: boolean;
}

export interface ConsumerStatusState {
    statusLoading: boolean;
    statusLoaded: boolean;
    statusError: YTError | null;
    consumerData: {
        queues?: Record<string, YtConsumerStatus>;
        registrations?: Array<ConsumerQueueInfo>;
    } | null;
}

export const initialState: ConsumerStatusState = {
    statusLoading: false,
    statusLoaded: false,
    statusError: null,
    consumerData: null,
};

function reducer(state = initialState, action: ConsumerStatusAction): ConsumerStatusState {
    switch (action.type) {
        case CONSUMER_STATUS_LOAD_REQUEST: {
            return {...state, statusLoading: true};
        }

        case CONSUMER_STATUS_LOAD_SUCCESS: {
            return {
                ...state,
                consumerData: action.data,
                statusLoading: false,
                statusLoaded: true,
                statusError: null,
            };
        }

        case CONSUMER_STATUS_LOAD_FAILURE: {
            return {...state, statusLoading: false, statusError: action.data};
        }

        default: {
            return state;
        }
    }
}

export type ConsumerStatusAction =
    | Action<typeof CONSUMER_STATUS_LOAD_REQUEST>
    | ActionD<typeof CONSUMER_STATUS_LOAD_SUCCESS, ConsumerStatusState['consumerData']>
    | ActionD<typeof CONSUMER_STATUS_LOAD_FAILURE, YTError>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
