import axios from 'axios';
import {ThunkAction} from 'redux-thunk';

import {RootState} from '../../../../../store/reducers';
import {
    AccessLogAction,
    AccessLogAvailableTimeRange,
    AccessLogData,
} from '../../../../../store/reducers/navigation/tabs/access-log/access-log';
import {
    ACCESS_LOG_FAILURE,
    ACCESS_LOG_FILTERS,
    ACCESS_LOG_PARTIAL,
    ACCESS_LOG_PATH_CHANGED,
    ACCESS_LOG_REQUEST,
    ACCESS_LOG_RESET_FILTERS,
    ACCESS_LOG_SUCCESS,
} from '../../../../../constants/navigation/tabs/access-log';
import {
    getAccessLogFilterPagination,
    getAccessLogLastLoadedParams,
    getAccessLogRequestParams,
} from '../../../../../store/selectors/navigation/tabs/access-log';
import {
    AccessLogFilterAction,
    AccessLogFiltersState,
} from '../../../../../store/reducers/navigation/tabs/access-log/access-log-filters';
import CancelHelper, {isCancelled} from '../../../../../utils/cancel-helper';
import {getAccessLogBasePath} from '../../../../../config';

type AccessLogThunkAction<Res = any> = ThunkAction<Res, RootState, any, AccessLogAction>;
type AccessLogFiltersThunkAction<Res = any> = ThunkAction<
    Res,
    RootState,
    any,
    AccessLogFilterAction
>;

export function resetPaginationIfNeededAndCheckIfPathChanged(): AccessLogFiltersThunkAction<Boolean> {
    return (dispatch, getState) => {
        const state = getState();

        const lastLoadedParams = getAccessLogLastLoadedParams(state);
        const params = getAccessLogRequestParams(state);

        const result = params.path !== lastLoadedParams.path;

        if (result) {
            dispatch({type: ACCESS_LOG_PATH_CHANGED});
        }

        return result;
    };
}

const accesLogCancelHelper = new CancelHelper();

export function fetchAccessLog(): AccessLogThunkAction {
    return (dispatch, getState) => {
        const pathChanged = dispatch(resetPaginationIfNeededAndCheckIfPathChanged());
        dispatch({type: ACCESS_LOG_REQUEST, data: pathChanged ? {loaded: false} : {}});

        const state = getState();
        const params = getAccessLogRequestParams(state);

        dispatch({type: ACCESS_LOG_PARTIAL, data: {params}});
        return Promise.all([
            axios.get(`${getAccessLogBasePath()}/ready`),
            axios
                .request<AccessLogAvailableTimeRange>({
                    method: 'POST',
                    url: `${getAccessLogBasePath()}/visible-time-range`,
                    withCredentials: true,
                    data: {cluster: params.cluster},
                    cancelToken: accesLogCancelHelper.removeAllAndGenerateNextToken(),
                })
                .catch((e) => {
                    console.log(e);
                    return {data: {latest: undefined, erliest: undefined}};
                }),
            axios.request<AccessLogData>({
                method: 'POST',
                url: `${getAccessLogBasePath()}/access_log`,
                data: params,
                withCredentials: true,
                cancelToken: accesLogCancelHelper.generateNextToken(),
            }),
        ])
            .then(([{data: ready}, {data: availableTimeRange}, {data}]) => {
                dispatch({
                    type: ACCESS_LOG_SUCCESS,
                    data: {...data, ready, availableTimeRange, params},
                });
            })
            .catch((e: any) => {
                if (!isCancelled(e)) {
                    const error = e?.response?.data || e;
                    dispatch({type: ACCESS_LOG_FAILURE, data: {error}});
                }
            });
    };
}

export function applyAccessLogFilters(): AccessLogFiltersThunkAction {
    return (dispatch) => {
        dispatch(setAccessLogFiltersPage(0));
    };
}

export function setAccessLogFilters(
    data: Partial<AccessLogFiltersState>,
): AccessLogFiltersThunkAction {
    return (dispatch) => {
        dispatch({type: ACCESS_LOG_FILTERS, data});
    };
}

export function setAccessLogFiltersPage(index: number): AccessLogFiltersThunkAction {
    return (dispatch, getState) => {
        const {size} = getAccessLogFilterPagination(getState());
        dispatch({type: ACCESS_LOG_FILTERS, data: {pagination: {index, size}}});
        dispatch(fetchAccessLog());
    };
}

export function accessLogResetFilters(): AccessLogFiltersThunkAction {
    return (dispatch, getState) => {
        const lastLoadedParams = getAccessLogLastLoadedParams(getState());
        if (!lastLoadedParams.path) {
            // skip for initial loading
            return;
        }

        return dispatch({type: ACCESS_LOG_RESET_FILTERS});
    };
}
