import {type ThunkAction} from 'redux-thunk';

import {
    CONSUMER_PARTITIONS_LOAD_FAILURE,
    CONSUMER_PARTITIONS_LOAD_REQUEST,
    CONSUMER_PARTITIONS_LOAD_SUCCESS,
} from '../../../../../constants/navigation/tabs/consumer';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {type RootState} from '../../../../../store/reducers';
import {type ConsumerPartitionsAction} from '../../../../../store/reducers/navigation/tabs/consumer/partitions';
import {type YtConsumerPartition} from '../../../../../store/reducers/navigation/tabs/consumer/types';
import {selectPath, selectTransaction} from '../../../../../store/selectors/navigation';
import {prepareRequest} from '../../../../../utils/navigation';
import ypath from '../../../../../common/thor/ypath';
import {
    selectConsumerName,
    selectConsumerPartitionsRequestKey,
} from '../../../../selectors/navigation/tabs/consumer';

type ConsumerThunkAction = ThunkAction<void, RootState, unknown, ConsumerPartitionsAction>;

let nextRequestId = 0;

export function loadConsumerPartitions(queue: string): ConsumerThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = selectPath(state);
        const transaction = selectTransaction(state);
        const name = selectConsumerName(state);
        const requestKey = selectConsumerPartitionsRequestKey(state);
        const requestId = ++nextRequestId;
        const isCurrent = () =>
            requestKey === selectConsumerPartitionsRequestKey(getState()) &&
            requestId === getState().navigation.tabs.consumer.partitions.requestId;
        const consumerPath =
            name === undefined ? '' : `/consumers/${ypath.YPath.escapeSpecialCharacters(name)}`;

        dispatch({type: CONSUMER_PARTITIONS_LOAD_REQUEST, data: {requestKey, requestId}});
        return ytApiV3Id
            .get(
                YTApiId.queueConsumerPartitions,
                prepareRequest(
                    `/@queue_consumer_partitions${consumerPath}/${ypath.YPath.escapeSpecialCharacters(queue)}`,
                    {
                        path,
                        transaction,
                    },
                ),
            )
            .then((data: YtConsumerPartition[]) => {
                if (!isCurrent()) return;
                dispatch({
                    type: CONSUMER_PARTITIONS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                if (!isCurrent()) return;
                dispatch({
                    type: CONSUMER_PARTITIONS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
