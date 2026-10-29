import ypath from '../../../common/thor/ypath';

import filter_ from 'lodash/filter';
import isEqual_ from 'lodash/isEqual';

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
import {selectCurrentUserName} from '../../../store/selectors/global';
import {RumWrapper, YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {parseAccountsData, parseAccountsListData} from './accounts-ts';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {selectAccountsRequestParams} from '../../../store/selectors/accounts/request-params';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';

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

const cancelHelper = new CancelHelper();

function parseAccounts(rumId, accounts, parseData = parseAccountsData) {
    const items = filter_(
        ypath.getValue(accounts),
        (item) => ypath.getValue(item) !== ROOT_ACCOUNT_NAME,
    );
    return rumId.parse(YTApiId.accountsData, () => parseData(items));
}

function fetchAccountsList({params, isCurrentRequest}) {
    return (dispatch) => {
        dispatch({
            type: FETCH_ACCOUNTS_RESOURCE.REQUEST,
        });

        const rumId = new RumWrapper(params.cluster, RumMeasureTypes.ACCOUNTS);
        return rumId
            .fetch(
                YTApiId.accountsListData,
                ytApiV3Id.list(
                    YTApiId.accountsListData,
                    {
                        path: '//sys/accounts/',
                        attributes: listAttributesToLoad,
                        ...USE_MAX_SIZE,
                        ...USE_CACHE(),
                    },
                    cancelHelper.saveCancelToken,
                ),
            )
            .then((accounts) => parseAccounts(rumId, accounts, parseAccountsListData))
            .then((accounts) => {
                if (!isCurrentRequest()) {
                    return null;
                }
                dispatch({
                    type: FETCH_ACCOUNTS_RESOURCE.SUCCESS,
                    data: {accounts},
                });
                return accounts;
            })
            .catch((error) => {
                if (!isCancelled(error) && isCurrentRequest()) {
                    dispatch({
                        type: FETCH_ACCOUNTS_RESOURCE.FAILURE,
                        data: {error},
                    });
                }
                throw error;
            });
    };
}

async function fetchAllAccountsData(rumId) {
    const data = await rumId.fetch(
        YTApiId.accountsData,
        ytApiV3Id.list(
            YTApiId.accountsData,
            {
                path: '//sys/accounts/',
                attributes: attributesToLoad,
                ...USE_MAX_SIZE,
                ...USE_CACHE(),
            },
            cancelHelper.saveCancelToken,
        ),
    );
    return {data, error: undefined};
}

function fetchAccountsMetadata({params, isCurrentRequest}) {
    return async (dispatch) => {
        const rumId = new RumWrapper(params.cluster, RumMeasureTypes.ACCOUNTS);
        dispatch({type: FETCH_ACCOUNTS_METADATA.REQUEST});

        try {
            const {data} = await fetchAllAccountsData(rumId);
            const accounts = await parseAccounts(rumId, data);
            if (isCurrentRequest()) {
                dispatch({
                    type: FETCH_ACCOUNTS_METADATA.SUCCESS,
                    data: {accounts},
                });
            }
        } catch (error) {
            if (!isCancelled(error) && isCurrentRequest()) {
                dispatch({type: FETCH_ACCOUNTS_METADATA.FAILURE, data: {error}});
            }
        }
    };
}

function fetchAccountsTotals(request) {
    return fetchAccountsResource(
        request,
        YTApiId.accountsTotals,
        FETCH_ACCOUNTS_TOTAL_USAGE,
        '//sys/accounts/@',
        ['total_resource_limits', 'total_resource_usage'],
    );
}

function fetchAccountsNodes(request) {
    return fetchAccountsResource(
        request,
        YTApiId.accountsNodes,
        FETCH_ACCOUNTS_NODES,
        '//sys/cluster_nodes/@',
        ['available_space_per_medium', 'io_statistics_per_medium', 'used_space_per_medium'],
    );
}

function fetchUsableAccounts(request) {
    return (dispatch, getState) => {
        const userName = selectCurrentUserName(getState());
        return dispatch(
            fetchAccountsResource(
                request,
                YTApiId.listUsableAccounts,
                FETCH_ACCOUNTS_USABLE,
                '//sys/users/' + userName + '/@usable_accounts',
            ),
        );
    };
}

function fetchAccountsResource({isCurrentRequest}, apiId, actionType, path, attributes) {
    return (dispatch) => {
        return ytApiV3Id
            .get(apiId, {path, ...(attributes ? {attributes} : {})}, cancelHelper.saveCancelToken)
            .then((data) => {
                if (isCurrentRequest()) {
                    dispatch({type: actionType.SUCCESS, data});
                    return data;
                }
                return undefined;
            })
            .catch((error) => {
                if (!isCancelled(error) && isCurrentRequest()) {
                    dispatch({type: actionType.FAILURE, data: {error}});
                }
            });
    };
}

function fetchAccountsDetails(request) {
    return (dispatch) => {
        return Promise.all([
            dispatch(fetchUsableAccounts(request)),
            dispatch(fetchAccountsMetadata(request)),
            dispatch(fetchAccountsTotals(request)),
            dispatch(fetchAccountsNodes(request)),
        ]);
    };
}

export function fetchAccounts(params) {
    return (dispatch, getState) => {
        const cancelToken = cancelHelper.removeAllAndGenerateNextToken();
        const isCurrentRequest = () =>
            !cancelToken.reason && isEqual_(selectAccountsRequestParams(getState()), params);
        const request = {params, isCurrentRequest};
        return dispatch(fetchAccountsList(request))
            .then((accounts) => {
                if (!accounts || !isCurrentRequest()) return undefined;
                return dispatch(fetchAccountsDetails(request)).then(() => accounts);
            })
            .catch(() => undefined);
    };
}

export function reloadAccounts() {
    return (dispatch, getState) => dispatch(fetchAccounts(selectAccountsRequestParams(getState())));
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
