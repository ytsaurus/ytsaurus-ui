import {
    CONSUMER_PARTITIONS_LOAD_REQUEST,
    CONSUMER_PARTITIONS_LOAD_SUCCESS,
    CONSUMER_PARTITIONS_LOAD_FAILURE,
} from '../../../../../constants/navigation/tabs/consumer';
import type {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD, YTError} from '../../../../../types';
import type {YtConsumerPartition} from './types';

export interface ConsumerPartitionsState {
    partitionsLoading: boolean;
    partitionsLoaded: boolean;
    partitionsError: YTError | null;
    partitionsData: YtConsumerPartition[] | null;
}

export const initialState: ConsumerPartitionsState = {
    partitionsLoading: false,
    partitionsLoaded: false,
    partitionsError: null,
    partitionsData: null,
};

function reducer(state = initialState, action: ConsumerPartitionsAction): ConsumerPartitionsState {
    switch (action.type) {
        case CONSUMER_PARTITIONS_LOAD_REQUEST: {
            return {...state, partitionsLoading: true};
        }

        case CONSUMER_PARTITIONS_LOAD_SUCCESS: {
            return {
                ...state,
                partitionsData: action.data,
                partitionsLoading: false,
                partitionsLoaded: true,
                partitionsError: null,
            };
        }

        case CONSUMER_PARTITIONS_LOAD_FAILURE: {
            return {...state, partitionsLoading: false, partitionsError: action.data};
        }

        default: {
            return state;
        }
    }
}

export type ConsumerPartitionsAction =
    | Action<typeof CONSUMER_PARTITIONS_LOAD_REQUEST>
    | ActionD<typeof CONSUMER_PARTITIONS_LOAD_SUCCESS, YtConsumerPartition[]>
    | ActionD<typeof CONSUMER_PARTITIONS_LOAD_FAILURE, YTError>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
