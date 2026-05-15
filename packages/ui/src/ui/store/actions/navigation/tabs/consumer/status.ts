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
import {type ConsumerFiltersAction} from '../../../../../store/reducers/navigation/tabs/consumer/filters';
import {prepareRequest} from '../../../../../utils/navigation';
import {
    selectConsumerRegisteredQueues,
    selectTargetQueue,
} from '../../../../../store/selectors/navigation/tabs/consumer';
import {changeConsumerFilters} from './filters';

type ConsumerThunkAction = ThunkAction<
    void,
    RootState,
    unknown,
    ConsumerStatusAction | ConsumerFiltersAction
>;

export function loadConsumerStatus(): ConsumerThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = selectPath(state);
        const transaction = selectTransaction(state);

        dispatch({type: CONSUMER_STATUS_LOAD_REQUEST});
        return ytApiV3Id
            .get(
                YTApiId.queueConsumerStatus,
                prepareRequest('/@queue_consumer_status', {path, transaction}),
            )
            .then((data) => {
                if (data.error) {
                    throw data.error;
                }
                dispatch({
                    type: CONSUMER_STATUS_LOAD_SUCCESS,
                    data,
                });

                const state2 = getState();
                const targetQueue = selectTargetQueue(state2);
                const queues = selectConsumerRegisteredQueues(state2);
                if (targetQueue && !queues?.find(({queue}) => targetQueue.queue === queue)) {
                    dispatch(changeConsumerFilters({targetQueue: undefined}));
                }
            })
            .catch((error: Error) => {
                dispatch({
                    type: CONSUMER_STATUS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
