import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {LOAD_FILE, MAX_FILE_SIZE} from '../../../../constants/navigation/content/file';
import {ytApiV3} from '../../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function loadFile() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: LOAD_FILE.REQUEST});
        requests.removeAllRequests();

        return ytApiV3
            .readFile(
                prepareRequest({path, transaction, length: MAX_FILE_SIZE}),
                requests.saveCancelToken,
            )
            .then((file) => {
                dispatch({
                    type: LOAD_FILE.SUCCESS,
                    data: {file},
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: LOAD_FILE.CANCELLED});
                } else {
                    dispatch({
                        type: LOAD_FILE.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_FILE.CANCELLED});
    };
}
