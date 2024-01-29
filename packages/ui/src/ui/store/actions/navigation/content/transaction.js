import CancelHelper from '../../../../utils/cancel-helper';
import {navigateParent} from '../../../../store/actions/navigation';
import {ABORT_TRANSACTION} from '../../../../constants/navigation/content/transaction';
import {ytApiV3} from '../../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function abortTransaction(id) {
    return (dispatch) => {
        dispatch({type: ABORT_TRANSACTION.REQUEST});

        return ytApiV3
            .abortTransaction({
                parameters: {transaction_id: id},
                cancellation: requests.saveCancelToken,
            })
            .then(() => {
                dispatch(navigateParent());
                dispatch({type: ABORT_TRANSACTION.SUCCESS});
            })
            .catch((error) => {
                dispatch({
                    type: ABORT_TRANSACTION.FAILURE,
                    data: {error},
                });
            });
    };
}

export function resetStore() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: ABORT_TRANSACTION.CANCELLED});
    };
}
