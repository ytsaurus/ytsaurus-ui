import type {ThunkAction} from 'redux-thunk';

import {
    QUEUE_STATUS_LOAD_FAILURE,
    QUEUE_STATUS_LOAD_REQUEST,
    QUEUE_STATUS_LOAD_SUCCESS,
} from '../../../../../constants/navigation/tabs/queue';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import type {RootState} from '../../../../../store/reducers';
import type {QueueStatusAction} from '../../../../../store/reducers/navigation/tabs/queue/status';
import type {YtQueueStatus} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {prepareRequest} from '../../../../../utils/navigation';

type QueueThunkAction = ThunkAction<void, RootState, unknown, QueueStatusAction>;

export function loadQueueStatus(): QueueThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: QUEUE_STATUS_LOAD_REQUEST});
        return ytApiV3Id
            .get(YTApiId.queueStatus, prepareRequest('/@queue_status', {path, transaction}))
            .then((data: YtQueueStatus) => {
                if (data.error) {
                    throw data.error;
                }
                dispatch({
                    type: QUEUE_STATUS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                dispatch({
                    type: QUEUE_STATUS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
