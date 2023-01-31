import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import CancelHelper from '../../../../utils/cancel-helper';
import {TYPED_OUTPUT_FORMAT} from '../../../../constants/index';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {GET_DOCUMENT} from '../../../../constants/navigation/content/document';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function getDocument() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: GET_DOCUMENT.REQUEST});
        requests.removeAllRequests();

        return ytApiV3Id
            .get(YTApiId.navigationGetDocument, {
                parameters: prepareRequest({
                    path,
                    transaction,
                    output_format: TYPED_OUTPUT_FORMAT,
                }),
                cancellation: requests.saveCancelToken,
            })
            .then((document) => {
                dispatch({
                    type: GET_DOCUMENT.SUCCESS,
                    data: {document},
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_DOCUMENT.CANCELLED});
                } else {
                    dispatch({
                        type: GET_DOCUMENT.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_DOCUMENT.CANCELLED});
    };
}
