import axios from 'axios';

import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {
    CHANGE_VERSION_SUMMARY_PARTIAL,
    DISCOVER_VERSIONS,
} from '../../../../constants/components/versions/versions_v2';
import {getCluster} from '../../../../store/selectors/global';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {
    HostType,
    SummaryItem,
    VersionHostInfo,
    VersionSummaryItem,
    VersionsAction,
} from '../../../../store/reducers/components/versions/versions_v2';
import {SortState} from '../../../../types';

export interface DiscoverVersionsData {
    details: Array<VersionHostInfo>;
    summary: Record<'total' | 'error' | string, VersionSummary>;
}

type VersionSummary = Record<HostType, SummaryItem>;

type NodesThunkAction<T = void> = ThunkAction<Promise<T>, RootState, unknown, any>;

export function getVersions(): NodesThunkAction<DiscoverVersionsData> {
    return (dispatch, getState) => {
        dispatch({type: DISCOVER_VERSIONS.REQUEST});

        const cluster = getCluster(getState());

        return axios
            .get<DiscoverVersionsData>(`/api/yt-proxy/${cluster}/internal-discover_versions`)
            .then(({data}) => {
                const summary = prepareSummary(data.summary);
                const details = prepareDetails(data.details);

                dispatch({
                    type: DISCOVER_VERSIONS.SUCCESS,
                    data: {summary, details},
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

export function changeHostFilter(hostFilter: string): VersionsAction {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {hostFilter},
    };
}

export function changeVersionFilter(versionFilter: string): VersionsAction {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {versionFilter},
    };
}

export function changeTypeFilter(typeFilter: string): VersionsAction {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {typeFilter},
    };
}

export function changeStateFilter(stateFilter: string): VersionsAction {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {stateFilter},
    };
}

export function changeBannedFilter(bannedFilter: 'all' | boolean): VersionsAction {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {bannedFilter: bannedFilter || false},
    };
}

function prepareGroup(group: VersionSummary, version: string) {
    const res = reduce_(
        group,
        (acc, value, type) => {
            const {total, banned, offline} = value;

            const k = type as HostType;
            acc[k] = total;
            acc.banned += banned;
            acc.offline += offline;
            acc.online += total - offline;

            return acc;
        },
        {banned: 0, offline: 0, online: 0, version} as VersionSummaryItem,
    );

    return {
        ...res,
        banned: res.banned || undefined,
        offline: res.offline || undefined,
        online: res.online || undefined,
    };
}

function prepareSummary({total, error, ...versions}: DiscoverVersionsData['summary']) {
    const preparedTotal = prepareGroup(total, 'total');
    const preparedError = error && prepareGroup(error, 'error');
    const preparedVersions = map_(versions, prepareGroup);

    return [...preparedVersions, preparedError, preparedTotal];
}

function prepareDetails(details: DiscoverVersionsData['details']) {
    return map_(details, (item) => {
        const calculatedState = item.offline ? 'offline' : 'online';
        item.state = item.state ? item.state : calculatedState;
        if (item.error) {
            item.state = 'error';
        }

        item.banned = Boolean(item.banned);
        return item;
    });
}

export function changeVersionStateTypeFilters(data: {
    version?: string;
    state?: string;
    type?: string;
    banned?: boolean;
}) {
    const {version, state, type, banned} = data;
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {
            stateFilter: state || 'all',
            versionFilter: version || 'all',
            typeFilter: type || 'all',
            bannedFilter: banned === undefined ? 'all' : banned,
        },
    };
}

export function setVersionsSummarySortState(summarySortState: SortState) {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {summarySortState},
    };
}

export function changeCheckedHideOffline(checkedHideOffline: boolean) {
    return {
        type: CHANGE_VERSION_SUMMARY_PARTIAL,
        data: {checkedHideOffline},
    };
}
