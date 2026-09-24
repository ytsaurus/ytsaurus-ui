import ypath from '../../../common/thor/ypath';

import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';

import {setSetting} from '../../../store/actions/settings';
import {accountsTrackVisit} from '../../../store/actions/favourites';
import {
    ACCOUNTS_TABLE_ID,
    CHANGE_CONTENT_MODE_FILTER,
    CHANGE_MEDIUM_TYPE_FILTER,
    CHANGE_NAME_FILTER,
    FETCH_ACCOUNTS_METADATA,
    FETCH_ACCOUNTS_NODES,
    FETCH_ACCOUNTS_RESOURCE,
    FETCH_ACCOUNTS_TOTAL_USAGE,
    FETCH_ACCOUNTS_USABLE,
    FILTER_USABLE_ACCOUNTS,
    ROOT_ACCOUNT_NAME,
    SET_ACCOUNTS_TREE_STATE,
    SET_ACTIVE_ACCOUNT,
} from '../../../constants/accounts/accounts';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../constants/accounts';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';
import {selectCluster, selectCurrentUserName} from '../../../store/selectors/global';
import {
    selectAccountsDisabledCacheForNextFetch,
    selectAccountsEditCounter,
} from '../../../store/selectors/accounts/accounts-ts';
import {RumWrapper, YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {parseAccountsData} from './accounts-ts';
import Account from '../../../pages/accounts/selector';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';

const attributesToLoad = [
    'abc',
    'diskSpaceLimit',
    'parent_name',
    'responsibles',
    'totalDiskSpace',
    'resource_limits',
    'resource_usage',
    'committed_resource_usage',
    'recursive_resource_usage',
    'recursive_committed_resource_usage',
    'recursive_violated_resource_limits',
    'allow_children_limit_overcommit',
    'total_children_resource_limits',
    'folder_id',
];

const listAttributesToLoad = ['parent_name', 'abc'];

const requestGenerations = new Map();

function startRequest(scope) {
    const generation = (requestGenerations.get(scope) || 0) + 1;
    requestGenerations.set(scope, generation);
    return generation;
}

function isLatestRequest(scope, generation) {
    return requestGenerations.get(scope) === generation;
}

function getCacheParams(state) {
    return selectAccountsDisabledCacheForNextFetch(state) ? {} : USE_CACHE;
}

function parseAccounts(rumId, accounts) {
    const items = filter_(
        ypath.getValue(accounts),
        (item) => ypath.getValue(item) !== ROOT_ACCOUNT_NAME,
    );
    return rumId
        .parse(YTApiId.accountsData, parseAccountsData(items))
        .then((res) => map_(res, (item) => new Account(item)));
}

function isCurrentRequest(getState, cluster, editCounter) {
    const state = getState();
    return (
        selectCluster(state) === cluster &&
        (editCounter === undefined || selectAccountsEditCounter(state) === editCounter)
    );
}

export function resetAccountsCacheIfCurrent(editCounter) {
    return (dispatch, getState) => {
        if (selectAccountsEditCounter(getState()) === editCounter) {
            dispatch({
                type: ACCOUNTS_DATA_FIELDS_ACTION,
                data: {disableCacheForNextFetch: false},
            });
        }
    };
}

export function fetchAccountsList() {
    return (dispatch, getState) => {
        dispatch({
            type: FETCH_ACCOUNTS_RESOURCE.REQUEST,
        });

        const state = getState();
        const cluster = selectCluster(state);
        const editCounter = selectAccountsEditCounter(state);
        const requestGeneration = startRequest('list');
        const rumId = new RumWrapper(cluster, RumMeasureTypes.ACCOUNTS);
        return rumId
            .fetch(
                YTApiId.accountsData,
                ytApiV3Id.list(YTApiId.accountsData, {
                    path: '//sys/accounts/',
                    attributes: listAttributesToLoad,
                    ...USE_MAX_SIZE,
                    ...getCacheParams(state),
                }),
            )
            .then((accounts) => parseAccounts(rumId, accounts))
            .then((accounts) => {
                if (
                    !isLatestRequest('list', requestGeneration) ||
                    !isCurrentRequest(getState, cluster, editCounter)
                ) {
                    return null;
                }
                dispatch({
                    type: FETCH_ACCOUNTS_RESOURCE.SUCCESS,
                    data: {accounts},
                });
                return accounts;
            })
            .catch((error) => {
                if (
                    isLatestRequest('list', requestGeneration) &&
                    isCurrentRequest(getState, cluster, editCounter)
                ) {
                    dispatch({
                        type: FETCH_ACCOUNTS_RESOURCE.FAILURE,
                        data: {error},
                    });
                }
                throw error;
            });
    };
}

export function fetchAccountsMetadata() {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = selectCluster(state);
        const editCounter = selectAccountsEditCounter(state);
        const requestGeneration = startRequest('metadata');
        const rumId = new RumWrapper(cluster, RumMeasureTypes.ACCOUNTS);
        dispatch({type: FETCH_ACCOUNTS_METADATA.REQUEST});

        return rumId
            .fetch(
                YTApiId.accountsData,
                ytApiV3Id.list(YTApiId.accountsData, {
                    path: '//sys/accounts/',
                    attributes: attributesToLoad,
                    ...USE_MAX_SIZE,
                    ...getCacheParams(state),
                }),
            )
            .then((accounts) => parseAccounts(rumId, accounts))
            .then((accounts) => {
                if (
                    !isLatestRequest('metadata', requestGeneration) ||
                    !isCurrentRequest(getState, cluster, editCounter)
                ) {
                    return;
                }
                dispatch({type: FETCH_ACCOUNTS_METADATA.SUCCESS, data: {accounts}});
            })
            .catch((error) => {
                if (
                    isLatestRequest('metadata', requestGeneration) &&
                    isCurrentRequest(getState, cluster, editCounter)
                ) {
                    dispatch({type: FETCH_ACCOUNTS_METADATA.FAILURE, data: {error}});
                }
            });
    };
}

export function fetchAccountsTotals() {
    return fetchAccountsResource(FETCH_ACCOUNTS_TOTAL_USAGE, '//sys/accounts/@', [
        'total_resource_limits',
        'total_resource_usage',
    ]);
}

export function fetchAccountsNodes() {
    return fetchAccountsResource(FETCH_ACCOUNTS_NODES, '//sys/cluster_nodes/@', [
        'available_space_per_medium',
        'io_statistics_per_medium',
        'used_space_per_medium',
    ]);
}

export function fetchUsableAccounts() {
    return (dispatch, getState) => {
        const state = getState();
        const userName = selectCurrentUserName(state);
        return fetchAccountsResource(
            FETCH_ACCOUNTS_USABLE,
            '//sys/users/' + userName + '/@usable_accounts',
            undefined,
        )(dispatch, getState);
    };
}

function fetchAccountsResource(actionType, path, attributes) {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = selectCluster(state);
        const editCounter = selectAccountsEditCounter(state);
        const requestScope = actionType.SUCCESS;
        const requestGeneration = startRequest(requestScope);
        return ytApiV3Id
            .get(YTApiId.accountsData, {path, ...(attributes ? {attributes} : {})})
            .then((data) => {
                if (
                    isLatestRequest(requestScope, requestGeneration) &&
                    isCurrentRequest(getState, cluster, editCounter)
                ) {
                    dispatch({type: actionType.SUCCESS, data});
                }
            })
            .catch((error) => {
                if (
                    isLatestRequest(requestScope, requestGeneration) &&
                    isCurrentRequest(getState, cluster, editCounter)
                ) {
                    dispatch({type: actionType.FAILURE, data: {error}});
                }
            });
    };
}

export function fetchAccountsDetails() {
    return (dispatch) =>
        Promise.all([
            dispatch(fetchAccountsMetadata()),
            dispatch(fetchAccountsTotals()),
            dispatch(fetchAccountsNodes()),
            dispatch(fetchUsableAccounts()),
        ]);
}

// Also used outside the page updater by editor and account hierarchy actions.
export function fetchAccounts() {
    return (dispatch, getState) => {
        const editCounter = selectAccountsEditCounter(getState());
        return dispatch(fetchAccountsList())
            .then((accounts) => {
                if (!accounts) {
                    return undefined;
                }
                return dispatch(fetchAccountsDetails()).then(() => accounts);
            })
            .then((accounts) => {
                if (accounts) {
                    dispatch(resetAccountsCacheIfCurrent(editCounter));
                }
                return accounts;
            })
            .catch(() => undefined);
    };
}

export function accountsIncreaseEditCounter() {
    return (dispatch, getState) => {
        const editCounter = selectAccountsEditCounter(getState());
        return dispatch({
            type: ACCOUNTS_DATA_FIELDS_ACTION,
            data: {
                editCounter: editCounter + 1,
                disableCacheForNextFetch: true,
                fullAccountsLoaded: false,
            },
        });
    };
}

export function changeNameFilter(newFilter) {
    return (dispatch, getState) => {
        const {tables} = getState();
        const sortState = tables[ACCOUNTS_TABLE_ID];

        dispatch({
            type: CHANGE_NAME_FILTER,
            data: {newFilter, sortState},
        });
    };
}

export function setActiveAccount(account) {
    return (dispatch) => {
        if (account) {
            dispatch(accountsTrackVisit(account));
        }
        return dispatch({
            type: SET_ACTIVE_ACCOUNT,
            data: {account},
        });
    };
}

export function changeContentFilter(newFilter) {
    return {
        type: CHANGE_CONTENT_MODE_FILTER,
        data: {newFilter},
    };
}

export function changeMediumFilter(newFilter) {
    return {
        type: CHANGE_MEDIUM_TYPE_FILTER,
        data: {newFilter},
    };
}

export function filterUsableAccounts() {
    return (dispatch, getState) => {
        const {tables} = getState();
        const sortState = tables[ACCOUNTS_TABLE_ID];

        dispatch({
            type: FILTER_USABLE_ACCOUNTS,
            data: {sortState},
        });
    };
}

export function setAccountsTreeState(treeState) {
    return {
        type: SET_ACCOUNTS_TREE_STATE,
        data: {treeState},
    };
}

export function setAccountsVisibilityModeOfDashboard(value) {
    return (dispatch) => {
        return dispatch(
            setSetting(SettingName.ACCOUNTS.DASHBOARD_VISIBILITY_MODE, NAMESPACES.ACCOUNTS, value),
        );
    };
}

export function setAccountsVisibilityMode(value) {
    return (dispatch) => {
        return dispatch(
            setSetting(SettingName.ACCOUNTS.ACCOUNTS_VISIBILITY_MODE, NAMESPACES.ACCOUNTS, value),
        );
    };
}

export function setAccountsAbcServiceFilter(id, slug) {
    return (dispatch) => {
        dispatch({
            type: ACCOUNTS_DATA_FIELDS_ACTION,
            data: {abcServiceFilter: {slug}},
        });
    };
}
