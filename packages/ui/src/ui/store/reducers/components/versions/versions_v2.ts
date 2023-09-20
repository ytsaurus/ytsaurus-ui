import {Action} from 'redux';

import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import {
    CHANGE_VERSION_SUMMARY_PARTIAL,
    DISCOVER_VERSIONS,
} from '../../../../constants/components/versions/versions_v2';
import {YTError} from '../../../../../@types/types';
import {ActionD, SortState} from '../../../../types';

export type VersionsState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    details: Array<VersionHostInfo>;
    summary: Array<VersionSummaryItem>;
};

export type VersionsFiltersState = {
    hostFilter: string;
    versionFilter: string;
    typeFilter: string;
    stateFilter: string;
    bannedFilter: 'all' | boolean;
    summarySortState: SortState; //{column: 'version'; order: 'asc'};
    checkedHideOffline: true;
};

export interface SummaryItem {
    total: number;
    banned: number;
    offline: number;
    online: number;
}

export type VersionHostState = 'online' | 'offline' | 'banned';

export type HostType =
    | 'controller_agent'
    | 'primary_master'
    | 'secondary_master'
    | 'node'
    | 'cluster_node'
    | 'http_proxy'
    | 'rpc_proxy'
    | 'scheduler'
    | 'job_proxy';

export interface VersionHostInfo {
    address: string;
    banned: boolean;
    type: HostType;
    version: string;
    start_time: string;
    state: string;
    offline: boolean;
    error: unknown;
}

export type VersionSummaryItem = Partial<Record<HostType, number>> &
    Record<'banned' | 'online' | 'offline', number> & {version: string};

const ephemeralState: VersionsState = {
    loading: false,
    loaded: false,
    error: undefined,

    details: [],
    summary: [],
};

const persistedState: VersionsFiltersState = {
    hostFilter: '',
    versionFilter: 'all',
    typeFilter: 'all',
    stateFilter: 'all',
    bannedFilter: 'all',
    summarySortState: {column: 'version', order: 'asc'},
    checkedHideOffline: true,
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action: VersionsAction): typeof initialState => {
    switch (action.type) {
        case DISCOVER_VERSIONS.REQUEST:
            return {...state, loading: true};

        case DISCOVER_VERSIONS.SUCCESS: {
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: undefined,
            };
        }

        case DISCOVER_VERSIONS.FAILURE:
            return {
                ...state,
                loading: false,
                ...action.data,
            };

        case CHANGE_VERSION_SUMMARY_PARTIAL:
            return {...state, ...action.data};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);

export type VersionsAction =
    | Action<typeof DISCOVER_VERSIONS.REQUEST>
    | ActionD<typeof DISCOVER_VERSIONS.SUCCESS, Pick<VersionsState, 'details' | 'summary'>>
    | ActionD<typeof DISCOVER_VERSIONS.FAILURE, Pick<VersionsState, 'error'>>
    | ActionD<typeof CHANGE_VERSION_SUMMARY_PARTIAL, Partial<VersionsFiltersState>>;
