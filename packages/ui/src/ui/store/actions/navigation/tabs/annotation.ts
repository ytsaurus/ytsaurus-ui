import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {GET_ANNOTATION} from '../../../../constants/navigation/tabs/annotation';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getBatchError} from '../../../../utils/utils';

const cancelHelper = new CancelHelper();

export function getAnnotation() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state) || '';

        const transaction = getTransaction(state);

        dispatch({type: GET_ANNOTATION.REQUEST});
        cancelHelper.removeAllRequests();

        const requests = [
            {
                command: 'get',
                parameters: prepareRequest('/@annotation', {
                    path,
                    transaction,
                }),
            },
        ];

        ytApiV3Id
            .executeBatch(YTApiId.navigationGetAnnotation, {
                parameters: {requests},
                cancellation: cancelHelper.saveCancelToken,
            })
            .then((results) => {
                const err = getBatchError(results, 'Cannot fetch annotation');
                if (yt.codes.NODE_DOES_NOT_EXIST !== results[0]?.error?.code && err) {
                    throw err;
                }

                const [{output: annotation}] = results;
                dispatch({
                    type: GET_ANNOTATION.SUCCESS,
                    data: {annotation, path},
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_ANNOTATION.CANCELLED});
                } else {
                    dispatch({
                        type: GET_ANNOTATION.FAILURE,
                        data: {error, path},
                    });
                }
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        cancelHelper.removeAllRequests();
        dispatch({type: GET_ANNOTATION.CANCELLED});
    };
}
