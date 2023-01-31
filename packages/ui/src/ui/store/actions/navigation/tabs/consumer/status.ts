import type {ThunkAction} from 'redux-thunk';

import {
    CONSUMER_STATUS_LOAD_REQUEST,
    CONSUMER_STATUS_LOAD_SUCCESS,
    CONSUMER_STATUS_LOAD_FAILURE,
} from '../../../../../constants/navigation/tabs/consumer';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import type {RootState} from '../../../../../store/reducers';
import type {ConsumerStatusAction} from '../../../../../store/reducers/navigation/tabs/consumer/status';
import type {YtConsumerStatus} from '../../../../../store/reducers/navigation/tabs/consumer/types';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {prepareRequest} from '../../../../../utils/navigation';

type ConsumerThunkAction = ThunkAction<void, RootState, unknown, ConsumerStatusAction>;

export function loadConsumerStatus(): ConsumerThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: CONSUMER_STATUS_LOAD_REQUEST});
        return ytApiV3Id
            .get(
                YTApiId.queueConsumerStatus,
                prepareRequest('/@queue_consumer_status', {path, transaction}),
            )
            .then((data: YtConsumerStatus) => {
                if (data.error) {
                    throw data.error;
                }
                dispatch({
                    type: CONSUMER_STATUS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                dispatch({
                    type: CONSUMER_STATUS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
