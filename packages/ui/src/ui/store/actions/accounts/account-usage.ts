import isEmpty_ from 'lodash/isEmpty';
import isEqual_ from 'lodash/isEqual';
import reduce_ from 'lodash/reduce';

import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {AccountsSnapshotsAction} from '../../reducers/accounts/usage/accounts-usage-snapshots';
import {
    ACCOUNTS_USAGE_FILTERS_PARTIAL,
    ACCOUNTS_USAGE_LIST_FAILED,
    ACCOUNTS_USAGE_LIST_REQUEST,
    ACCOUNTS_USAGE_LIST_SUCCESS,
    ACCOUNTS_USAGE_SNAPSHOTS_FAILED,
    ACCOUNTS_USAGE_SNAPSHOTS_REQUEST,
    ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS,
    ACCOUNTS_USAGE_TREE_FAILED,
    ACCOUNTS_USAGE_TREE_REQUEST,
    ACCOUNTS_USAGE_TREE_SUCCESS,
} from '../../../constants/accounts/accounts';
import axios from 'axios';
import {getAccountsUsageBaseUrl, getCluster} from '../../selectors/global';
import {
    AccountUsageListAction,
    AccountUsageListDataParams,
    AccountsUsageDataResponse,
} from '../../reducers/accounts/usage/accounts-usage-list';
import {
    getAccountUsageCurrentSnapshot,
    getAccountUsageDateRangeFilter,
    getAccountUsageFieldFiltersRequestParameter,
    getAccountUsageListRequestParams,
    getAccountUsageOwnerFilter,
    getAccountUsagePageIndex,
    getAccountUsagePathFilter,
    getAccountUsageSortState,
    getAccountUsageTreePath,
    getAccountUsageTreeRequestParams,
    getAccountUsageViewType,
} from '../../selectors/accounts/account-usage';
import {getActiveAccount} from '../../../store/selectors/accounts/accounts-ts';
import {getSettingsAccountUsageViewType} from '../../../store/selectors/settings/settings-ts';
import {SortState} from '../../../types';
import {
    AccountUsageFiltersState,
    AccountUsageViewType,
    AccountsUsageFiltersAction,
    PAGE_SIZE,
} from '../../reducers/accounts/usage/accounts-usage-filters';
import {
    AccountUsageTreeAction,
    AccountUsageTreeData,
} from '../../reducers/accounts/usage/accounts-usage-tree';
import {
    setSettingsAccountUsageColumnsList,
    setSettingsAccountUsageColumnsListFolders,
    setSettingsAccountUsageColumnsTree,
    setSettingsAccountUsageViewType,
} from '../settings/settings';
import {
    AccountUsageDataItem,
    AccountUsageDataParams,
} from '../../reducers/accounts/usage/account-usage-types';
import {fetchAccountUsageListDiff, fetchAccountUsageTreeDiff} from './account-usage-diff';
import {updateSortStateArray} from '../../../utils/sort-helpers';
import {Action} from 'redux';
import {openModal} from '../modals/attributes-modal';

type SnapshotsThunkAction = ThunkAction<any, RootState, any, AccountsSnapshotsAction>;

export function normalizeTimestamp(timestamp?: unknown): number {
    const seconds = Math.floor(Date.now() / 1000);
    if (!timestamp) return seconds;

    const parsed = Number(timestamp);
    return isNaN(parsed) ? seconds : parsed;
}

export function syncAccountsUsageViewTypeWithSettings(): FiltersThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const viewType = getAccountUsageViewType(state);
        if (!viewType) {
            const lastViewType = getSettingsAccountUsageViewType(state);
            dispatch(setAccountUsageFilters({viewType: lastViewType}));
        } else {
            dispatch(setSettingsAccountUsageViewType(viewType));
        }
    };
}

export function fetchAccountsUsageSnapshots(cluster: string): SnapshotsThunkAction {
    return (dispatch, getState) => {
        const accountsUsageBaseUrl = getAccountsUsageBaseUrl(getState());
        dispatch({type: ACCOUNTS_USAGE_SNAPSHOTS_REQUEST});

        return axios
            .request<{
                snapshot_timestamps: Array<number>;
            }>({
                method: 'POST',
                url: accountsUsageBaseUrl + 'list-timestamps',
                data: {cluster},
                withCredentials: true,
            })
            .then((data) => {
                dispatch({
                    type: ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS,
                    data: {...data.data, cluster},
                });
            })
            .catch((error: any) => {
                dispatch({
                    type: ACCOUNTS_USAGE_SNAPSHOTS_FAILED,
                    data: {error: error?.response?.data || error, cluster},
                });
            });
    };
}
type UsageListThunkAction = ThunkAction<any, RootState, any, AccountUsageListAction>;

export function getFilterParameters(state: RootState): AccountUsageDataParams {
    const account = getActiveAccount(state);
    const cluster = getCluster(state);
    const sortStates = getAccountUsageSortState(state);
    const path_regexp = getAccountUsagePathFilter(state);
    const owner = getAccountUsageOwnerFilter(state);

    const field_filters = getAccountUsageFieldFiltersRequestParameter(state);
    const viewType = getAccountUsageViewType(state);

    const row_filter: AccountUsageListDataParams['row_filter'] = Object.assign(
        {
            exclude_map_nodes: viewType === 'list' || viewType === 'list-diff',
        },
        owner ? {owner} : undefined,
        path_regexp ? {path_regexp} : undefined,
        field_filters?.length ? {field_filters} : undefined,
    );

    return {
        account,
        cluster,
        sort_order: reduce_(
            sortStates,
            (acc, {column, order}) => {
                if (column && order) {
                    acc.push({field: column, desc: order === 'desc'});
                }
                return acc;
            },
            [] as Required<AccountUsageListDataParams>['sort_order'],
        ),
        row_filter,
        page: {
            index: getAccountUsagePageIndex(state),
            size: PAGE_SIZE,
        },
    };
}

export function fetchAccountUsageList(): UsageListThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const timestamp = getAccountUsageCurrentSnapshot(state);
        const accountsUsageBaseUrl = getAccountsUsageBaseUrl(state);

        const params = getFilterParameters(state);
        const requestParams: AccountUsageListDataParams = {
            ...params,
            timestamp: normalizeTimestamp(timestamp),
        };

        dispatch({
            type: ACCOUNTS_USAGE_LIST_REQUEST,
            data: {requestParams},
        });

        return axios
            .request<AccountsUsageDataResponse>({
                method: 'POST',
                url: accountsUsageBaseUrl + 'get-resource-usage',
                data: requestParams,
                withCredentials: true,
            })
            .then((response) => {
                const params = getAccountUsageListRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_LIST_SUCCESS,
                    data: {response: response.data},
                });
            })
            .catch((error: any) => {
                const params = getAccountUsageListRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_LIST_FAILED,
                    data: {error: error?.response?.data || error},
                });
            });
    };
}

type UsageTreeThunkAction = ThunkAction<any, RootState, any, AccountUsageTreeAction>;

export function fetchAccountUsageTree(): UsageTreeThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const timestamp = getAccountUsageCurrentSnapshot(state);
        const accountsUsageBaseUrl = getAccountsUsageBaseUrl(state);

        const params = getFilterParameters(state);
        const requestParams: AccountUsageTreeData['requestParams'] = {
            ...params,
            timestamp: normalizeTimestamp(timestamp),
            row_filter: {
                ...params.row_filter,
                base_path: getAccountUsageTreePath(state),
            },
        };

        dispatch({
            type: ACCOUNTS_USAGE_TREE_REQUEST,
            data: {requestParams},
        });

        return axios
            .request<AccountsUsageDataResponse>({
                method: 'POST',
                url: accountsUsageBaseUrl + 'get-children-and-resource-usage',
                data: requestParams,
                withCredentials: true,
            })
            .then((response) => {
                const params = getAccountUsageTreeRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_TREE_SUCCESS,
                    data: {
                        response: response.data,
                        base_path: requestParams.row_filter.base_path,
                    },
                });
            })
            .catch((error: any) => {
                const params = getAccountUsageTreeRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_TREE_FAILED,
                    data: {error: error?.response?.data || error},
                });
            });
    };
}

type FiltersThunkAction = ThunkAction<
    any,
    RootState,
    any,
    AccountUsageTreeAction | AccountUsageListAction | AccountsUsageFiltersAction
>;

export function fetchAccountUsage(): FiltersThunkAction {
    return (dispatch, getState) => {
        const viewType = getAccountUsageViewType(getState());
        switch (viewType) {
            case 'tree':
                return dispatch(fetchAccountUsageTree());
            case 'list':
            case 'list-plus-folders':
                return dispatch(fetchAccountUsageList());
            case 'list-diff':
            case 'list-plus-folders-diff':
                return dispatch(fetchAccountUsageListDiff());
            case 'tree-diff':
                return dispatch(fetchAccountUsageTreeDiff());
        }
    };
}

export function setAccountUsageSortState(item: SortState, multisort?: boolean): FiltersThunkAction {
    return (dispatch, getState) => {
        const prevSortState = getAccountUsageSortState(getState());
        const sortState = updateSortStateArray(prevSortState, item, {multisort});

        dispatch({
            type: ACCOUNTS_USAGE_FILTERS_PARTIAL,
            data: {sortState, pageIndex: 0},
        });
        dispatch(fetchAccountUsage());
    };
}

export function setAccountUsageCurrentSnapshot(currentSnapshot: number): FiltersThunkAction {
    return (dispatch) => {
        dispatch({
            type: ACCOUNTS_USAGE_FILTERS_PARTIAL,
            data: {currentSnapshot},
        });
    };
}
export function setAccountUsageDataFilter(
    data: Omit<Partial<AccountUsageFiltersState>, 'columnPreset' | 'viewType' | 'pageIndex'>,
): FiltersThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: ACCOUNTS_USAGE_FILTERS_PARTIAL,
            data: {pageIndex: 0, ...data},
        });

        const {dateRangeType, ...rest} = data;
        if (isEmpty_(rest) && dateRangeType) {
            const {from, to} = getAccountUsageDateRangeFilter(getState());
            if (!from && !to) {
                return;
            }
        }
        dispatch(fetchAccountUsage());
    };
}

export function setAccountUsageDataPageIndex(pageIndex: number): FiltersThunkAction {
    return (dispatch) => {
        dispatch({type: ACCOUNTS_USAGE_FILTERS_PARTIAL, data: {pageIndex}});
        dispatch(fetchAccountUsage());
    };
}

export function setAccountUsageFilters(
    data: Pick<Partial<AccountUsageFiltersState>, 'visibleColumns' | 'viewType'>,
): FiltersThunkAction {
    return (dispatch) => {
        dispatch({type: ACCOUNTS_USAGE_FILTERS_PARTIAL, data});
    };
}

export function setAccountUsageViewType(viewType: AccountUsageViewType): FiltersThunkAction {
    return (dispatch) => {
        dispatch({
            type: ACCOUNTS_USAGE_FILTERS_PARTIAL,
            data: {pageIndex: 0, viewType},
        });
        dispatch(setSettingsAccountUsageViewType(viewType));
    };
}

export function setAccountUsageColumns(columns: Array<string>): FiltersThunkAction {
    return (dispatch, getState) => {
        const viewType = getAccountUsageViewType(getState());
        switch (viewType) {
            case 'list':
            case 'list-diff':
                dispatch(setSettingsAccountUsageColumnsList(columns));
                break;
            case 'list-plus-folders':
            case 'list-plus-folders-diff':
                dispatch(setSettingsAccountUsageColumnsListFolders(columns));
                break;
            default:
                dispatch(setSettingsAccountUsageColumnsTree(columns));
        }
    };
}

export const openAccountAttributesModal =
    ({
        cluster,
        row,
    }: {
        cluster: string;
        row: AccountUsageDataItem;
    }): ThunkAction<void, RootState, null, Action> =>
    (dispatch, getState) => {
        const accountsUsageBaseUrl = getAccountsUsageBaseUrl(getState());
        return dispatch(
            openModal({
                title: row.path,
                promise: axios
                    .request({
                        method: 'POST',
                        url: accountsUsageBaseUrl + 'get-versioned-resource-usage',
                        data: {
                            ...row,
                            cluster,
                            timestamp_rounding_policy: 'closest',
                        },
                        withCredentials: true,
                    })
                    .then((data) => data.data),
            }),
        );
    };
