import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {TYPED_OUTPUT_FORMAT} from '../../../../constants/index';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {GET_USER_ATTRIBUTE_KEYS} from '../../../../constants/navigation/tabs/user-attributes';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function getUserAttributeKeys() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: GET_USER_ATTRIBUTE_KEYS.REQUEST});
        requests.removeAllRequests();

        ytApiV3Id
            .get(YTApiId.navigationUserAttributeKeys, {
                parameters: prepareRequest('/@user_attribute_keys', {
                    path,
                    transaction,
                    output_format: TYPED_OUTPUT_FORMAT,
                }),
                cancellation: requests.saveCancelToken,
            })
            .then((userAttributeKeys) => {
                dispatch({
                    type: GET_USER_ATTRIBUTE_KEYS.SUCCESS,
                    data: {userAttributeKeys},
                });
            })
            .catch((error) => {
                if (isCancelled(error)) {
                    dispatch({type: GET_USER_ATTRIBUTE_KEYS.CANCELLED});
                } else {
                    dispatch({
                        type: GET_USER_ATTRIBUTE_KEYS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_USER_ATTRIBUTE_KEYS.CANCELLED});
    };
}
