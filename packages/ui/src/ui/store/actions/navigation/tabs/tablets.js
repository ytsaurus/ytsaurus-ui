import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {TYPED_OUTPUT_FORMAT} from '../../../../constants/index';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {
    GET_TABLETS,
    CHANGE_TABLETS_MODE,
    TOGGLE_HISTOGRAM,
    CHANGE_ACTIVE_HISTOGRAM,
    TABLETS_STATE_PARTIAL,
} from '../../../../constants/navigation/tabs/tablets';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getTabletsExpandedHosts} from '../../../../store/selectors/navigation/tabs/tablets-ts';

const requests = new CancelHelper();

export function loadTablets() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: GET_TABLETS.REQUEST});
        requests.removeAllRequests();

        return ytApiV3Id
            .get(YTApiId.navigationTablets, {
                parameters: prepareRequest('/@tablets', {
                    path,
                    transaction,
                    output_format: TYPED_OUTPUT_FORMAT,
                }),
                cancellation: requests.saveCancelToken,
            })
            .then((tablets) => {
                dispatch({
                    type: GET_TABLETS.SUCCESS,
                    data: {tablets},
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_TABLETS.CANCELLED});
                } else {
                    dispatch({
                        type: GET_TABLETS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function changeTabletsFilter(tabletsFilter) {
    return {
        type: TABLETS_STATE_PARTIAL,
        data: {tabletsFilter},
    };
}

export function changeTabletsMode(evt) {
    return {
        type: CHANGE_TABLETS_MODE,
        data: {tabletsMode: evt.target.value},
    };
}

export function toggleExpandedHost(name) {
    return (dispatch, getState) => {
        const expandedHosts = getTabletsExpandedHosts(getState()).slice();
        const index = expandedHosts.indexOf(name);
        if (index >= 0) {
            expandedHosts.splice(index, 1);
        } else {
            expandedHosts.push(name);
        }
        dispatch({type: TABLETS_STATE_PARTIAL, data: {expandedHosts}});
    };
}

export function changeActiveHistogram(histogramType) {
    return {
        type: CHANGE_ACTIVE_HISTOGRAM,
        data: {histogramType},
    };
}

export function toggleHistogram() {
    return {
        type: TOGGLE_HISTOGRAM,
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_TABLETS.CANCELLED});
    };
}
