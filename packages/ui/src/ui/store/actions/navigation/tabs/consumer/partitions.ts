import type {ThunkAction} from 'redux-thunk';

import {
    CONSUMER_PARTITIONS_LOAD_REQUEST,
    CONSUMER_PARTITIONS_LOAD_SUCCESS,
    CONSUMER_PARTITIONS_LOAD_FAILURE,
} from '../../../../../constants/navigation/tabs/consumer';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import type {RootState} from '../../../../../store/reducers';
import type {ConsumerPartitionsAction} from '../../../../../store/reducers/navigation/tabs/consumer/partitions';
import type {YtConsumerPartition} from '../../../../../store/reducers/navigation/tabs/consumer/types';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {prepareRequest} from '../../../../../utils/navigation';

type ConsumerThunkAction = ThunkAction<void, RootState, unknown, ConsumerPartitionsAction>;

export function loadConsumerPartitions(): ConsumerThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: CONSUMER_PARTITIONS_LOAD_REQUEST});
        return ytApiV3Id
            .get(
                YTApiId.queueConsumerPartitions,
                prepareRequest('/@queue_consumer_partitions', {path, transaction}),
            )
            .then((data: YtConsumerPartition[]) => {
                dispatch({
                    type: CONSUMER_PARTITIONS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                dispatch({
                    type: CONSUMER_PARTITIONS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
