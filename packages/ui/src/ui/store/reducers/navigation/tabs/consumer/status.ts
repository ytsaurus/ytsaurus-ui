import {
    CONSUMER_STATUS_LOAD_REQUEST,
    CONSUMER_STATUS_LOAD_SUCCESS,
    CONSUMER_STATUS_LOAD_FAILURE,
} from '../../../../../constants/navigation/tabs/consumer';
import type {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD, YTError} from '../../../../../types';
import type {YtConsumerStatus} from './types';

export interface ConsumerStatusState {
    statusLoading: boolean;
    statusLoaded: boolean;
    statusError: YTError | null;
    statusData: YtConsumerStatus | null;
}

export const initialState: ConsumerStatusState = {
    statusLoading: false,
    statusLoaded: false,
    statusError: null,
    statusData: null,
};

function reducer(state = initialState, action: ConsumerStatusAction): ConsumerStatusState {
    switch (action.type) {
        case CONSUMER_STATUS_LOAD_REQUEST: {
            return {...state, statusLoading: true};
        }

        case CONSUMER_STATUS_LOAD_SUCCESS: {
            return {
                ...state,
                statusData: action.data,
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
    | ActionD<typeof CONSUMER_STATUS_LOAD_SUCCESS, YtConsumerStatus>
    | ActionD<typeof CONSUMER_STATUS_LOAD_FAILURE, YTError>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
