import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import _ from 'lodash';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction, getParsedPath} from '../../../../store/selectors/navigation';
import Transaction from '../../../../utils/navigation/content/transaction-map/transaction';
import {
    LOAD_TRANSACTIONS,
    CHANGE_FILTER,
} from '../../../../constants/navigation/content/transaction-map';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function loadTransactions() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const parsedPath = getParsedPath(state);
        const transaction = getTransaction(state);

        dispatch({type: LOAD_TRANSACTIONS.REQUEST});
        requests.removeAllRequests();

        return ytApiV3Id
            .list(YTApiId.navigationListTransactions, {
                parameters: prepareRequest('/', {
                    path,
                    transaction,
                    attributes: ['type', 'title', 'start_time', 'owner'],
                }),
                cancellation: requests.saveCancelToken,
            })
            .then((rawTransactions) => {
                const transactions = ypath.getValue(rawTransactions, '');

                dispatch({
                    type: LOAD_TRANSACTIONS.SUCCESS,
                    data: {
                        transactions: _.map(
                            transactions,
                            (transaction) => new Transaction(transaction, parsedPath),
                        ),
                    },
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: LOAD_TRANSACTIONS.CANCELLED});
                } else {
                    dispatch({
                        type: LOAD_TRANSACTIONS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function changeFilter(filter) {
    return {
        type: CHANGE_FILTER,
        data: {filter},
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_TRANSACTIONS.CANCELLED});
    };
}
