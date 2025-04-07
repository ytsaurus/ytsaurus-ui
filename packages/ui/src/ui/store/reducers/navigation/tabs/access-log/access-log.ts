import {ActionD, YTError} from '../../../../../types';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    ACCESS_LOG_FAILURE,
    ACCESS_LOG_PARTIAL,
    ACCESS_LOG_PATH_CHANGED,
    ACCESS_LOG_REQUEST,
    ACCESS_LOG_RESET_FILTERS,
    ACCESS_LOG_SUCCESS,
} from '../../../../../constants/navigation/tabs/access-log';
import {AccessLogFilterParams} from './access-log-filters';
import {Action} from 'redux';

export interface AccessLogState extends AccessLogData {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    params: Partial<AccessLogFilterParams> & {path: string};

    ready: boolean;
    availableTimeRange: AccessLogAvailableTimeRange;
}

export interface AccessLogAvailableTimeRange {
    earliest?: number;
    latest?: number;
}

export interface AccessLogData {
    accesses: Array<AccessLogItem>;
    total_row_count: number;
}

export type AccessLogItem = {
    type?: string;
    scope?: string;
    method: string;
    user: string;
    user_type?: string;
    instant: string;
    path: string;
    transaction_info?: AccessLogTransactionInfo;
    method_group?: string;
    destination_path?: string;
} & AccessLogExtraPaths;

type AccessLogExtraPaths =
    | {target_path?: string; original_path?: undefined}
    | {original_path?: string; target_path?: undefined};

/**
 * see /docs/description/common/access_log#zamechaniya
 */
export interface AccessLogTransactionInfo {
    transaction_id: string;
    transaction_title?: string;
    operation_id?: string;
    operation_title?: string;
    parent?: AccessLogTransactionInfo;
}

const initialState: AccessLogState = {
    loading: false,
    loaded: false,
    error: undefined,

    ready: true,
    accesses: [],
    total_row_count: 0,
    params: {path: ''},

    availableTimeRange: {},
};

function reducer(state = initialState, action: AccessLogAction) {
    switch (action.type) {
        case ACCESS_LOG_PATH_CHANGED:
        case ACCESS_LOG_RESET_FILTERS:
            return initialState;
        case ACCESS_LOG_REQUEST:
            return {...state, ...action.data, loading: true, error: undefined};
        case ACCESS_LOG_SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true, error: undefined};
        case ACCESS_LOG_FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
        case ACCESS_LOG_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type AccessLogAction =
    | Action<typeof ACCESS_LOG_RESET_FILTERS>
    | Action<typeof ACCESS_LOG_PATH_CHANGED>
    | ActionD<typeof ACCESS_LOG_REQUEST, Partial<Pick<AccessLogState, 'loaded'>>>
    | ActionD<typeof ACCESS_LOG_SUCCESS, Omit<AccessLogState, 'loading' | 'loaded' | 'error'>>
    | ActionD<typeof ACCESS_LOG_FAILURE, Pick<AccessLogState, 'error'>>
    | ActionD<typeof ACCESS_LOG_PARTIAL, Partial<Pick<AccessLogState, 'params'>>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
