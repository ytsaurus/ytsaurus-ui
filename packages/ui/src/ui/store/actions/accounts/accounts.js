import ypath from '../../../common/thor/ypath';
import _ from 'lodash';

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
    FETCH_ACCOUNTS_NODES,
    FETCH_ACCOUNTS_RESOURCE,
    FETCH_ACCOUNTS_TOTAL_USAGE,
    FETCH_ACCOUNTS_USABLE,
    FILTER_USABLE_ACCOUNTS,
    OPEN_EDITOR_MODAL,
    ROOT_ACCOUNT_NAME,
    SET_ACCOUNTS_TREE_STATE,
    SET_ACTIVE_ACCOUNT,
    UPDATE_EDITABLE_ACCOUNT,
} from '../../../constants/accounts/accounts';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../constants/accounts';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';
import {
    getAccountsDisabledCacheForNextFetch,
    getAccountsEditCounter,
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

export function fetchAccounts() {
    return (dispatch, getState) => {
        dispatch({
            type: FETCH_ACCOUNTS_RESOURCE.REQUEST,
        });

        const state = getState();
        const cluster = getCluster(state);
        const userName = getCurrentUserName(state);
        const disableCacheForNextFetch = getAccountsDisabledCacheForNextFetch(state);

        const cacheParams = disableCacheForNextFetch ? {} : USE_CACHE;

        const requests = [
            {
                command: 'list',
                parameters: {
                    path: '//sys/accounts/',
                    attributes: attributesToLoad,
                    ...USE_MAX_SIZE,
                    ...cacheParams,
                },
            },
            {
                command: 'get',
                parameters: {
                    path: '//sys/accounts/@',
                    attributes: ['total_resource_limits', 'total_resource_usage'],
                },
            },
            {
                command: 'get',
                parameters: {
                    path: '//sys/cluster_nodes/@',
                    attributes: [
                        'available_space_per_medium',
                        'io_statistics_per_medium',
                        'used_space_per_medium',
                    ],
                },
            },
            {
                command: 'get',
                parameters: {
                    path: '//sys/users/' + userName + '/@usable_accounts',
                },
            },
        ];

        const rumId = new RumWrapper(cluster, RumMeasureTypes.ACCOUNTS);
        return rumId
            .fetch(YTApiId.accountsData, ytApiV3Id.executeBatch(YTApiId.accountsData, {requests}))
            .then((batchData) => {
                dispatch({
                    type: ACCOUNTS_DATA_FIELDS_ACTION,
                    data: {disableCacheForNextFetch: false},
                });

                const [
                    {error: accountsError, output: accounts},
                    {error: resourceError, output: resources},
                    {error: nodesError, output: nodes},
                    {error: usableAccountsError, output: usableAccounts},
                ] = batchData;
                Promise.resolve(accountsError)
                    .then((e) => {
                        if (e) {
                            throw e;
                        }
                        const items = _.filter(
                            ypath.getValue(accounts),
                            (item) => ypath.getValue(item) !== ROOT_ACCOUNT_NAME,
                        );
                        return rumId
                            .parse(YTApiId.accountsData, parseAccountsData(items))
                            .then((res) => {
                                dispatch({
                                    type: FETCH_ACCOUNTS_RESOURCE.SUCCESS,
                                    data: {
                                        accounts: _.map(res, (item) => new Account(item)),
                                    },
                                });
                            });
                    })
                    .catch((error) => {
                        dispatch({
                            type: FETCH_ACCOUNTS_RESOURCE.FAILURE,
                            data: {error},
                        });
                    });

                if (!resourceError) {
                    dispatch({
                        type: FETCH_ACCOUNTS_TOTAL_USAGE.SUCCESS,
                        data: resources,
                    });
                } else {
                    dispatch({
                        type: FETCH_ACCOUNTS_TOTAL_USAGE.FAILURE,
                        data: {error: resourceError},
                    });
                }

                if (!nodesError) {
                    dispatch({
                        type: FETCH_ACCOUNTS_NODES.SUCCESS,
                        data: nodes,
                    });
                } else {
                    dispatch({
                        type: FETCH_ACCOUNTS_NODES.FAILURE,
                        data: {error: nodesError},
                    });
                }

                if (!usableAccountsError) {
                    dispatch({
                        type: FETCH_ACCOUNTS_USABLE.SUCCESS,
                        data: usableAccounts,
                    });
                } else {
                    dispatch({
                        type: FETCH_ACCOUNTS_USABLE.FAILURE,
                        data: {error: usableAccountsError},
                    });
                }
            });
    };
}

export function accountsIncreaseEditCounter() {
    return (dispatch, getState) => {
        const editCounter = getAccountsEditCounter(getState());
        return {
            type: ACCOUNTS_DATA_FIELDS_ACTION,
            data: {editCounter: editCounter + 1, disableCacheForNextFetch: true},
        };
    };
}

export function loadEditedAccount(accountName) {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        dispatch({
            type: UPDATE_EDITABLE_ACCOUNT.REQUEST,
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
                dispatch({
                    type: UPDATE_EDITABLE_ACCOUNT.SUCCESS,
                    data: {
                        account: new Account(item),
                        cluster,
                    },
                });
            })
            .catch(() => {
                dispatch({
                    type: UPDATE_EDITABLE_ACCOUNT.FAILURE,
                });
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
    return {
        type: OPEN_EDITOR_MODAL,
        data: {account},
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

export function closeEditorModal() {
    return (dispatch) => {
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
