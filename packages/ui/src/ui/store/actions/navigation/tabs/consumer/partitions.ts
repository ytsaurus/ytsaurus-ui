import {type CancelToken, type CancelTokenSource} from 'axios';
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
import CancelHelper, {isCancelled} from '../../../../../utils/cancel-helper';
import ypath from '../../../../../common/thor/ypath';
import {
    selectConsumerName,
    selectConsumerPartitionsRequestKey,
    selectTargetQueue,
} from '../../../../selectors/navigation/tabs/consumer';

type ConsumerThunkAction = ThunkAction<void, RootState, unknown, ConsumerPartitionsAction>;

const requests = new CancelHelper();

export function loadConsumerPartitions(queue: string): ConsumerThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        if (queue !== selectTargetQueue(state)?.queue) {
            return;
        }

        const path = selectPath(state);
        const transaction = selectTransaction(state);
        const consumerName = selectConsumerName(state);
        const requestKey = selectConsumerPartitionsRequestKey(state);
        let cancelToken: CancelToken | undefined;
        const isCurrent = () =>
            !cancelToken?.reason && requestKey === selectConsumerPartitionsRequestKey(getState());
        const consumerPath =
            consumerName === undefined
                ? ''
                : `/consumers/${ypath.YPath.escapeSpecialCharacters(consumerName)}`;

        dispatch({type: CONSUMER_PARTITIONS_LOAD_REQUEST, data: {requestKey}});
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
                (source: CancelTokenSource) => {
                    requests.removeAllAndSave(source);
                    cancelToken = source.token;
                },
            )
            .then((data: YtConsumerPartition[]) => {
                if (!isCurrent()) return;
                dispatch({
                    type: CONSUMER_PARTITIONS_LOAD_SUCCESS,
                    data,
                });
            })
            .catch((error: Error) => {
                if (isCancelled(error) || !isCurrent()) return;
                dispatch({
                    type: CONSUMER_PARTITIONS_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
