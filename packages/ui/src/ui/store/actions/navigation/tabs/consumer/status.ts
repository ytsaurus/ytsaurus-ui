import {type ThunkAction} from 'redux-thunk';

import {
    CONSUMER_STATUS_LOAD_FAILURE,
    CONSUMER_STATUS_LOAD_REQUEST,
    CONSUMER_STATUS_LOAD_SUCCESS,
} from '../../../../../constants/navigation/tabs/consumer';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {type RootState} from '../../../../../store/reducers';
import {type ConsumerStatusAction} from '../../../../../store/reducers/navigation/tabs/consumer/status';
import {selectPath, selectTransaction} from '../../../../../store/selectors/navigation';
import {prepareRequest} from '../../../../../utils/navigation';
import {selectCluster} from '../../../../../store/selectors/global';

type ConsumerThunkAction = ThunkAction<void, RootState, unknown, ConsumerStatusAction>;

let latestRequestId = 0;

export function loadConsumerStatus(): ConsumerThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = selectPath(state);
        const transaction = selectTransaction(state);
        const cluster = selectCluster(state);
        const requestId = ++latestRequestId;
        const isCurrent = () =>
            requestId === latestRequestId &&
            path === selectPath(getState()) &&
            transaction === selectTransaction(getState()) &&
            cluster === selectCluster(getState());

        dispatch({type: CONSUMER_STATUS_LOAD_REQUEST});
        return ytApiV3Id
            .get(
                YTApiId.queueConsumerStatus,
                prepareRequest('/@queue_consumer_status', {path, transaction}),
            )
            .then((data) => {
                if (!isCurrent()) return;
                if (data.error) {
                    throw data.error;
                }
                dispatch({
                    type: CONSUMER_STATUS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                if (!isCurrent()) return;
                dispatch({
                    type: CONSUMER_STATUS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
