import {
    COLS_NUMBER,
    GET_METRIC_DATA,
    ODIN_DATA_FIELDS,
    ROWS_NUMBER,
    SET_DATE,
    SET_HOURS_MINUTES,
    SET_METRIC,
    TOGGLE_USE_CURRENT_DATE,
} from '../odin-constants';
import {getDate, getMetric} from '../_selectors';
import CancelHelper from '../../../utils/cancel-helper';

import Utils from '../odin-utils';

const requests = new CancelHelper();

export function setMetric(metric) {
    return {
        type: SET_METRIC,
        data: {metric},
    };
}

export function toggleUseCurrentDate() {
    return {
        type: TOGGLE_USE_CURRENT_DATE,
    };
}

export function setDate(date) {
    return {
        type: SET_DATE,
        data: {date},
    };
}

export function setShowInfo(hours, minutes) {
    return {
        type: SET_HOURS_MINUTES,
        data: {hours, minutes},
    };
}

export function loadMetricAvailability(cluster) {
    return (dispatch, getState) => {
        const state = getState();
        const metric = getMetric(state);
        const date = getDate(state);

        dispatch({type: GET_METRIC_DATA.REQUEST});
        requests.removeAllRequests();

        Utils.getMetricOfThisDay(cluster, metric, date, requests.saveCancelToken)
            .then((data) => {
                const metricAvailability = Utils.prepareAvailabilityData(
                    data,
                    ROWS_NUMBER * COLS_NUMBER,
                );
                dispatch({
                    type: GET_METRIC_DATA.SUCCESS,
                    data: {metricAvailability},
                });
            })
            .catch((error) => {
                if (Utils.isRequestCanceled(error)) {
                    dispatch({type: GET_METRIC_DATA.CANCELLED});
                } else {
                    dispatch({
                        type: GET_METRIC_DATA.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function setOdinCluster(odinCluster) {
    return (dispatch) => {
        dispatch({type: ODIN_DATA_FIELDS, data: {odinCluster}});
        return dispatch(loadMetricAvailability(odinCluster));
    };
}
