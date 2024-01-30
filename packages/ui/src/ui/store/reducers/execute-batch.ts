import {ActionD, YTError} from '../../types';
import {
    EXECUTE_BATCH_RETRY_HIDE_MODAL,
    EXECUTE_BATCH_RETRY_SHOW_MODAL,
} from '../../constants/execute-batch';
import {ExecuteBatchOptions} from '../actions/execute-batch';
import {YTApiId} from '../../rum/rum-wrap-api';
import {BatchResultsItem, BatchSubRequest} from '../../../shared/yt-types';

export interface ExecuteBatchStateItem extends HandleExecuteBatchRetryParams {
    id: string;
    showModal: boolean;
    ytApiId: YTApiId;
}

export type ExecuteBatchState = Record<string, ExecuteBatchStateItem>;

export interface HandleExecuteBatchRetryParams {
    failed_requests: Array<BatchSubRequest>;
    error: YTError;
    resolveCb: (results: Array<BatchResultsItem<any>>) => void;
    rejectCb: (error: YTError) => void;
    options: ExecuteBatchOptions;
}

const initialState: ExecuteBatchState = {};

export default function executeBatchReducer(
    state = initialState,
    action: ExecuteBatchAction,
): ExecuteBatchState {
    switch (action.type) {
        case EXECUTE_BATCH_RETRY_SHOW_MODAL: {
            const res = {...state};
            res[action.data.id] = {
                ...action.data,
                showModal: true,
            };
            return res;
        }
        case EXECUTE_BATCH_RETRY_HIDE_MODAL: {
            const res = {...state};
            delete res[action.data.id];
            return res;
        }
    }
    return state;
}

export type ExecuteBatchAction =
    | ActionD<
          typeof EXECUTE_BATCH_RETRY_SHOW_MODAL,
          HandleExecuteBatchRetryParams & Pick<ExecuteBatchStateItem, 'id' | 'ytApiId'>
      >
    | ActionD<typeof EXECUTE_BATCH_RETRY_HIDE_MODAL, Pick<ExecuteBatchStateItem, 'id'>>;
