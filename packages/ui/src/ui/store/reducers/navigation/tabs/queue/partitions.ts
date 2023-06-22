import {
    QUEUE_PARTITIONS_LOAD_FAILURE,
    QUEUE_PARTITIONS_LOAD_REQUEST,
    QUEUE_PARTITIONS_LOAD_SUCCESS,
} from '../../../../../constants/navigation/tabs/queue';
import type {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD, YTError} from '../../../../../types';
import type {YtQueuePartition} from './types';

export interface QueuePartitionsState {
    partitionsLoading: boolean;
    partitionsLoaded: boolean;
    partitionsError: YTError | null;
    partitionsData: YtQueuePartition[] | null;
}

export const initialState: QueuePartitionsState = {
    partitionsLoading: false,
    partitionsLoaded: false,
    partitionsError: null,
    partitionsData: null,
};

function reducer(state = initialState, action: QueuePartitionsAction): QueuePartitionsState {
    switch (action.type) {
        case QUEUE_PARTITIONS_LOAD_REQUEST: {
            return {...state, partitionsLoading: true};
        }

        case QUEUE_PARTITIONS_LOAD_SUCCESS: {
            return {
                ...state,
                partitionsData: action.data,
                partitionsLoading: false,
                partitionsLoaded: true,
                partitionsError: null,
            };
        }

        case QUEUE_PARTITIONS_LOAD_FAILURE: {
            return {...state, partitionsLoading: false, partitionsError: action.data};
        }

        default: {
            return state;
        }
    }
}

export type QueuePartitionsAction =
    | Action<typeof QUEUE_PARTITIONS_LOAD_REQUEST>
    | ActionD<typeof QUEUE_PARTITIONS_LOAD_SUCCESS, YtQueuePartition[]>
    | ActionD<typeof QUEUE_PARTITIONS_LOAD_FAILURE, YTError>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
