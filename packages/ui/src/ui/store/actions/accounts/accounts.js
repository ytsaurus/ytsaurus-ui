import ypath from '../../../common/thor/ypath';

import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';

import {setSetting} from '../../../store/actions/settings';
import {accountsTrackVisit} from '../../../store/actions/favourites';
import {setAccountParent} from '../../../utils/accounts/editor';
import {
    ACCOUNTS_TABLE_ID,
    CHANGE_CONTENT_MODE_FILTER,
    CHANGE_MEDIUM_TYPE_FILTER,
    CHANGE_NAME_FILTER,
    CLOSE_EDITOR_MODAL,
    FETCH_ACCOUNTS_METADATA,
    FETCH_ACCOUNTS_NODES,
    FETCH_ACCOUNTS_RESOURCE,
    FETCH_ACCOUNTS_TOTAL_USAGE,
    FETCH_ACCOUNTS_USABLE,
    FETCH_ACTIVE_ACCOUNT,
    FILTER_USABLE_ACCOUNTS,
    ROOT_ACCOUNT_NAME,
    SET_ACCOUNTS_TREE_STATE,
    SET_ACTIVE_ACCOUNT,
    UPDATE_EDITABLE_ACCOUNT,
} from '../../../constants/accounts/accounts';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../constants/accounts';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';
import {selectCluster, selectCurrentUserName} from '../../../store/selectors/global';
import {
    selectAccountsDisabledCacheForNextFetch,
    selectAccountsEditCounter,
    selectActiveAccount,
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

const listAttributesToLoad = ['parent_name'];

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

function isCurrentRequest(getState, cluster, account, editCounter) {
    const state = getState();
    return (
        selectCluster(state) === cluster &&
        (editCounter === undefined || selectAccountsEditCounter(state) === editCounter) &&
        (account === undefined || selectActiveAccount(state) === account)
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
                    !isCurrentRequest(getState, cluster, undefined, editCounter)
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
                    isCurrentRequest(getState, cluster, undefined, editCounter)
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
        if (!isCurrentRequest(getState, cluster, '', editCounter)) {
            return Promise.resolve();
        }
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
                    !isCurrentRequest(getState, cluster, '', editCounter)
                ) {
                    return;
                }
                dispatch({type: FETCH_ACCOUNTS_METADATA.SUCCESS, data: {accounts}});
            })
            .catch((error) => {
                if (
                    isLatestRequest('metadata', requestGeneration) &&
                    isCurrentRequest(getState, cluster, '', editCounter)
                ) {
                    dispatch({type: FETCH_ACCOUNTS_METADATA.FAILURE, data: {error}});
                }
            });
    };
}

export function fetchActiveAccount(accountName) {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = selectCluster(state);
        const editCounter = selectAccountsEditCounter(state);
        const requestGeneration = startRequest('activeAccount');
        if (!isCurrentRequest(getState, cluster, accountName, editCounter)) {
            return Promise.resolve();
        }
        const rumId = new RumWrapper(cluster, RumMeasureTypes.ACCOUNTS);
        dispatch({type: FETCH_ACTIVE_ACCOUNT.REQUEST, data: {accountName}});

        return rumId
            .fetch(
                YTApiId.accountsData,
                ytApiV3Id.get(YTApiId.accountsData, {
                    path: '//sys/accounts/' + accountName + '/@',
                    attributes: attributesToLoad,
                    ...getCacheParams(state),
                }),
            )
            .then((attributes) =>
                rumId.parse(
                    YTApiId.accountsData,
                    parseAccountsData([{$value: accountName, $attributes: attributes}]),
                ),
            )
            .then(([item]) => {
                if (
                    !isLatestRequest('activeAccount', requestGeneration) ||
                    !isCurrentRequest(getState, cluster, accountName, editCounter)
                ) {
                    return;
                }
                dispatch({
                    type: FETCH_ACTIVE_ACCOUNT.SUCCESS,
                    data: {account: new Account(item), accountName},
                });
            })
            .catch((error) => {
                if (
                    isLatestRequest('activeAccount', requestGeneration) &&
                    isCurrentRequest(getState, cluster, accountName, editCounter)
                ) {
                    dispatch({type: FETCH_ACTIVE_ACCOUNT.FAILURE, data: {error, accountName}});
                }
            });
    };
}

export function fetchAccountsTotals() {
    return fetchAccountsResource(
        FETCH_ACCOUNTS_TOTAL_USAGE,
        '//sys/accounts/@',
        ['total_resource_limits', 'total_resource_usage'],
        '',
    );
}

export function fetchAccountsNodes() {
    return fetchAccountsResource(
        FETCH_ACCOUNTS_NODES,
        '//sys/cluster_nodes/@',
        ['available_space_per_medium', 'io_statistics_per_medium', 'used_space_per_medium'],
        '',
    );
}

export function fetchUsableAccounts() {
    return (dispatch, getState) => {
        const state = getState();
        const userName = selectCurrentUserName(state);
        return fetchAccountsResource(
            FETCH_ACCOUNTS_USABLE,
            '//sys/users/' + userName + '/@usable_accounts',
            undefined,
            '',
        )(dispatch, getState);
    };
}

function fetchAccountsResource(actionType, path, attributes, expectedAccount) {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = selectCluster(state);
        const editCounter = selectAccountsEditCounter(state);
        const requestScope = actionType.SUCCESS;
        const requestGeneration = startRequest(requestScope);
        if (!isCurrentRequest(getState, cluster, expectedAccount, editCounter)) {
            return Promise.resolve();
        }
        return ytApiV3Id
            .get(YTApiId.accountsData, {path, ...(attributes ? {attributes} : {})})
            .then((data) => {
                if (
                    isLatestRequest(requestScope, requestGeneration) &&
                    isCurrentRequest(getState, cluster, expectedAccount, editCounter)
                ) {
                    dispatch({type: actionType.SUCCESS, data});
                }
            })
            .catch((error) => {
                if (
                    isLatestRequest(requestScope, requestGeneration) &&
                    isCurrentRequest(getState, cluster, expectedAccount, editCounter)
                ) {
                    dispatch({type: actionType.FAILURE, data: {error}});
                }
            });
    };
}

// Kept for callers outside the page updater (editor and account hierarchy actions).
export function fetchAccounts() {
    return (dispatch, getState) => {
        const editCounter = selectAccountsEditCounter(getState());
        return dispatch(fetchAccountsList())
            .then((accounts) => {
                if (!accounts) {
                    return undefined;
                }
                const activeAccount = selectActiveAccount(getState());
                if (activeAccount) {
                    return dispatch(fetchActiveAccount(activeAccount)).then(() => accounts);
                }
                return Promise.all([
                    dispatch(fetchAccountsMetadata()),
                    dispatch(fetchAccountsTotals()),
                    dispatch(fetchAccountsNodes()),
                    dispatch(fetchUsableAccounts()),
                ]).then(() => accounts);
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
            data: {editCounter: editCounter + 1, disableCacheForNextFetch: true},
        });
    };
}

export function loadEditedAccount(accountName) {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = selectCluster(state);
        const requestGeneration = startRequest('editableAccount');
        dispatch({
            type: UPDATE_EDITABLE_ACCOUNT.REQUEST,
            data: {accountName},
        });

        const rumId = new RumWrapper(cluster, RumMeasureTypes.ACCOUNTS);
        return rumId
            .fetch(
                YTApiId.accountsEditData,
                ytApiV3Id.get(YTApiId.accountsEditData, {
                    path: '//sys/accounts/' + accountName + '/@',
                    attributes: attributesToLoad,
                }),
            )
            .then((data) =>
                rumId.parse(
                    YTApiId.accountsEditData,
                    parseAccountsData([{$value: accountName, $attributes: data}]),
                ),
            )
            .then(([item]) => {
                if (
                    !isLatestRequest('editableAccount', requestGeneration) ||
                    selectCluster(getState()) !== cluster
                ) {
                    return;
                }
                dispatch({
                    type: UPDATE_EDITABLE_ACCOUNT.SUCCESS,
                    data: {
                        account: new Account(item),
                        cluster,
                    },
                });
            })
            .catch((error) => {
                if (
                    isLatestRequest('editableAccount', requestGeneration) &&
                    selectCluster(getState()) === cluster
                ) {
                    dispatch({
                        type: UPDATE_EDITABLE_ACCOUNT.FAILURE,
                        data: {error, accountName},
                    });
                }
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

export function showEditorModal(account) {
    return (dispatch) => dispatch(loadEditedAccount(account.name));
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

export function closeEditorModal() {
    return (dispatch) => {
        startRequest('editableAccount');
        dispatch({
            type: CLOSE_EDITOR_MODAL,
        });
        return dispatch(fetchAccounts());
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

export function setParentAccountAction(name, parentName) {
    return async (dispatch) => {
        await setAccountParent(name, parentName);
        dispatch(fetchAccounts());
        await dispatch(loadEditedAccount(name));
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
