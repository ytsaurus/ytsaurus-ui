import {
    QUEUE_STATUS_LOAD_REQUEST,
    QUEUE_STATUS_LOAD_SUCCESS,
    QUEUE_STATUS_LOAD_FAILURE,
} from '../../../../../constants/navigation/tabs/queue';
import type {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD, YTError} from '../../../../../types';
import type {YtQueueStatus} from './types';

export interface QueueStatusState {
    statusLoading: boolean;
    statusLoaded: boolean;
    statusError: YTError | null;
    statusData: YtQueueStatus | null;
}

export const initialState: QueueStatusState = {
    statusLoading: false,
    statusLoaded: false,
    statusError: null,
    statusData: null,
};

function reducer(state = initialState, action: QueueStatusAction): QueueStatusState {
    switch (action.type) {
        case QUEUE_STATUS_LOAD_REQUEST: {
            return {...state, statusLoading: true};
        }

        case QUEUE_STATUS_LOAD_SUCCESS: {
            return {
                ...state,
                statusData: action.data,
                statusLoading: false,
                statusLoaded: true,
                statusError: null,
            };
        }

        case QUEUE_STATUS_LOAD_FAILURE: {
            return {...state, statusLoading: false, statusError: action.data};
        }

        default: {
            return state;
        }
    }
}

export type QueueStatusAction =
    | Action<typeof QUEUE_STATUS_LOAD_REQUEST>
    | ActionD<typeof QUEUE_STATUS_LOAD_SUCCESS, YtQueueStatus>
    | ActionD<typeof QUEUE_STATUS_LOAD_FAILURE, YTError>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
