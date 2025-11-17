import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import map_ from 'lodash/map';
import slice_ from 'lodash/slice';

import {splitBatchResults} from '../../../../../shared/utils/error';

import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {
    GET_LOCKS,
    IS_PARTIAL,
    MAX_TRANSACTIONS_REQUESTS,
} from '../../../../constants/navigation/tabs/locks';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

const requests = new CancelHelper();

function prepareData(locks, transactions = []) {
    return map_(locks, (lock, index) => {
        const item = {...lock};
        item.transaction = transactions[index] || {};
        item.transaction.id = item.transaction_id;
        item.index = index;

        return item;
    });
}

function getTransactions(rowLocks) {
    return (dispatch) => {
        const requests = map_(slice_(rowLocks, 0, MAX_TRANSACTIONS_REQUESTS), (lock) => {
            return {
                command: 'get',
                parameters: {
                    path: '//sys/transactions/' + lock.transaction_id + '/@',
                    attributes: ['title', 'start_time', 'operation_id'],
                },
            };
        });

        return ytApiV3Id
            .executeBatch(YTApiId.navigationTransactions, {requests})
            .then((data) => {
                const {error, results: transactions} = splitBatchResults(
                    data,
                    'Failed to get transactions',
                );
                if (error) {
                    return Promise.reject(error);
                }

                const locks = prepareData(rowLocks, transactions);
                const isPartial = locks.length > MAX_TRANSACTIONS_REQUESTS;

                dispatch({
                    type: IS_PARTIAL,
                    data: {isPartial},
                });

                dispatch({
                    type: GET_LOCKS.SUCCESS,
                    data: {locks},
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_LOCKS.FAILURE,
                    data: {error},
                });
            });
    };
}

export function getLocks() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: GET_LOCKS.REQUEST});
        requests.removeAllRequests();

        ytApiV3Id
            .get(YTApiId.navigationLocks, {
                parameters: prepareRequest('/@locks', {path, transaction}),
                cancellation: requests.saveCancelToken,
            })
            .then((locks) => dispatch(getTransactions(locks)))
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_LOCKS.CANCELLED});
                } else {
                    dispatch({
                        type: GET_LOCKS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_LOCKS.CANCELLED});
    };
}

export function setLocksModeFilter(modeFilter) {
    return {type: GET_LOCKS.PARTITION, data: {modeFilter}};
}
