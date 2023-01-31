import type {ThunkAction} from 'redux-thunk';
import {
    QUEUE_PARTITIONS_LOAD_REQUEST,
    QUEUE_PARTITIONS_LOAD_SUCCESS,
    QUEUE_PARTITIONS_LOAD_FAILURE,
} from '../../../../../constants/navigation/tabs/queue';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import type {RootState} from '../../../../../store/reducers';
import type {QueuePartitionsAction} from '../../../../../store/reducers/navigation/tabs/queue/partitions';
import type {YtQueuePartition} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {prepareRequest} from '../../../../../utils/navigation';

type QueueThunkAction = ThunkAction<void, RootState, unknown, QueuePartitionsAction>;

export function loadQueuePartitions(): QueueThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: QUEUE_PARTITIONS_LOAD_REQUEST});

        return ytApiV3Id
            .get(YTApiId.queuePartitions, prepareRequest('/@queue_partitions', {path, transaction}))
            .then(async (data: YtQueuePartition[]) => {
                dispatch({
                    type: QUEUE_PARTITIONS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                dispatch({
                    type: QUEUE_PARTITIONS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
