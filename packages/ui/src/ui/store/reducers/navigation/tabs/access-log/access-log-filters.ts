import {ActionD} from '../../../../../types';
import {
    ACCESS_LOG_FILTERS,
    ACCESS_LOG_PATH_CHANGED,
    ACCESS_LOG_RESET_FILTERS,
} from '../../../../../constants/navigation/tabs/access-log';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {Action} from 'redux';
import {EMPTY_OBJECT} from '../../../../../constants/index';
import {TimeRangeType} from '../../../../../utils/parse-serialize';

export interface AccessLogFiltersState {
    recursive: boolean;
    pagination: {
        size: number;
        index: number;
    };
    path_regex: string;
    user_regex: string;

    metadata?: boolean;

    scope: Record<AccessLogScopeType, boolean> | Record<keyof {}, boolean>;
    user_type: Record<AccessLogUserType, boolean> | Record<keyof {}, boolean>;
    method_group: Record<AccessLogMethodType, boolean> | Record<keyof {}, boolean>;
    field_selector: Record<AccessLogFieldSelectorType, boolean>;

    time: TimeRangeType;

    distinct_by?: 'user';
}

export type AccessLogFilterParams = Omit<AccessLogFiltersState, 'time'> & {
    begin: number;
    end: number;
};

export type AccessLogUserType = 'robot' | 'human' | 'system';
export type AccessLogMethodType =
    | 'read'
    | 'write'
    | 'lock'
    | 'link'
    | 'copy_move'
    | 'dynamic_table_commands';
export type AccessLogScopeType = 'other' | 'table' | 'file' | 'document' | 'directory';
export type AccessLogFieldSelectorType =
    //    | 'original_path'
    //    | 'target_path'
    'transaction_info' | 'method_group' | 'scope' | 'user_type';

export const initialState: AccessLogFiltersState = {
    recursive: true,
    pagination: {
        size: 100,
        index: 0,
    },
    path_regex: '',
    user_regex: '',

    metadata: undefined,

    scope: EMPTY_OBJECT,
    user_type: EMPTY_OBJECT,
    method_group: EMPTY_OBJECT,

    field_selector: {
        scope: false,
        method_group: false,
        user_type: false,
        transaction_info: false,
    },

    time: {shortcutValue: '4h'},

    distinct_by: undefined,
};

function reducer(state = initialState, action: AccessLogFilterAction) {
    switch (action.type) {
        case ACCESS_LOG_RESET_FILTERS:
            return initialState;
        case ACCESS_LOG_PATH_CHANGED:
            return {...state, pagination: {...state.pagination, index: 0}};
        case ACCESS_LOG_FILTERS:
            return {...state, ...action.data};
    }
    return state;
}

export type AccessLogFilterAction =
    | Action<typeof ACCESS_LOG_RESET_FILTERS>
    | Action<typeof ACCESS_LOG_PATH_CHANGED>
    | ActionD<typeof ACCESS_LOG_FILTERS, Partial<AccessLogFiltersState>>;

export default mergeStateOnClusterChange({}, initialState, reducer);
