import axios from 'axios';

import {
    CHANGE_BANNED_FILTER,
    CHANGE_HOST_FILTER,
    CHANGE_STATE_FILTER,
    CHANGE_TYPE_FILTER,
    CHANGE_VERSION_FILTER,
    DISCOVER_VERSIONS,
} from '../../../../constants/components/versions/versions_v2';
import {getCluster} from '../../../../store/selectors/global';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';

export interface DiscoverVersionsData {
    details: Array<VersionHostInfo>;
    summary: Record<'total' | string, VersionSummary>;
}

type VersionSummary = Record<HostType, SummaryItem>;

interface SummaryItem {
    total: number;
    banned: number;
    offline: number;
}

export type HostType =
    | 'controller_agent'
    | 'primary_master'
    | 'secondary_master'
    | 'node'
    | 'http_proxy'
    | 'rpc_proxy'
    | 'scheduler';

export interface VersionHostInfo {
    address: string;
    banned: boolean;
    type: HostType;
    version: string;
    start_time: string;
}

type NodesThunkAction<T = void> = ThunkAction<Promise<T>, RootState, unknown, any>;

export function getVersions(): NodesThunkAction<DiscoverVersionsData> {
    return (dispatch, getState) => {
        dispatch({type: DISCOVER_VERSIONS.REQUEST});

        const cluster = getCluster(getState());

        return axios
            .get<DiscoverVersionsData>(`/api/yt-proxy/${cluster}/internal-discover_versions`)
            .then(({data}) => {
                dispatch({
                    type: DISCOVER_VERSIONS.SUCCESS,
                    data: {versions: data},
                });
                return data;
            })
            .catch((error) => {
                dispatch({
                    type: DISCOVER_VERSIONS.FAILURE,
                    data: {error},
                });
                return Promise.reject(error);
            });
    };
}

export function changeHostFilter(hostFilter: string) {
    return {
        type: CHANGE_HOST_FILTER,
        data: {hostFilter},
    };
}

export function changeVersionFilter(versionFilter: string) {
    return {
        type: CHANGE_VERSION_FILTER,
        data: {versionFilter},
    };
}

export function changeTypeFilter(typeFilter: string) {
    return {
        type: CHANGE_TYPE_FILTER,
        data: {typeFilter},
    };
}

export function changeStateFilter(stateFilter: string) {
    return {
        type: CHANGE_STATE_FILTER,
        data: {stateFilter},
    };
}

export function changeBannedFilter(bannedFilter: boolean) {
    return {
        type: CHANGE_BANNED_FILTER,
        data: {bannedFilter: bannedFilter || false},
    };
}
