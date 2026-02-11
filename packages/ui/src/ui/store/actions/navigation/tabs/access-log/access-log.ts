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
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {getClusterUiConfig} from '../../../../../store/selectors/global';
import thorYPath from '../../../../../common/thor/ypath';
import {ClusterUiConfig, UiConfigBaseUrl} from '../../../../../../shared/yt-types';

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

function calcBaseUrl(url: string, state: RootState) {
    const uiConfig = getClusterUiConfig(state);
    return calcAccessLogBaseUrl(uiConfig, url);
}

export function calcAccessLogBaseUrl(uiConfig: ClusterUiConfig, url: string) {
    const {access_log_base_url} = uiConfig;
    const use_cors = thorYPath.getValue(access_log_base_url, '/@use_cors');
    return use_cors ? thorYPath.getValue(access_log_base_url) + `/${url.split('/').pop()}` : url;
}

export function fetchAccessLog(): AccessLogThunkAction {
    return (dispatch, getState) => {
        const pathChanged = dispatch(resetPaginationIfNeededAndCheckIfPathChanged());
        dispatch({type: ACCESS_LOG_REQUEST, data: pathChanged ? {loaded: false} : {}});

        const state = getState();
        const params = getAccessLogRequestParams(state);
        const {cluster} = params;

        dispatch({type: ACCESS_LOG_PARTIAL, data: {params}});

        return Promise.all([
            axios.get(calcBaseUrl(`/api/access-log/${cluster}/ready`, state)),
            axios
                .request<AccessLogAvailableTimeRange>({
                    method: 'POST',
                    url: calcBaseUrl(`/api/access-log/${cluster}/visible-time-range`, state),
                    withCredentials: true,
                    data: {cluster: params.cluster},
                    cancelToken: accesLogCancelHelper.removeAllAndGenerateNextToken(),
                })
                .catch((e) => {
                    // eslint-disable-next-line no-console
                    console.log(e);
                    return {data: {latest: undefined, erliest: undefined}};
                }),
            axios.request<AccessLogData>({
                method: 'POST',
                url: calcBaseUrl(`/api/access-log/${cluster}/access_log`, state),
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

export const fetchAccessLogQtId = (): AccessLogThunkAction => async (_, getState) => {
    const state = getState();
    const params = getAccessLogRequestParams(state);
    const {cluster} = params;

    const newParams = {...params} as Partial<typeof params>;
    delete newParams.pagination;

    const {data} = await wrapApiPromiseByToaster(
        axios.request({
            method: 'POST',
            url: calcBaseUrl(`/api/access-log/${cluster}/qt_access_log`, state),
            withCredentials: true,
            data: newParams,
        }),
        {
            toasterName: 'getAccessLogQtId',
            errorTitle: 'Failed to load access log query id',
            skipSuccessToast: true,
        },
    );

    window.open(`/${cluster}/queries/${data.query_id}`);
};

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
