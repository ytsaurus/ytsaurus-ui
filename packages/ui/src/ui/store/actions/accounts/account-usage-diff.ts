import isEqual_ from 'lodash/isEqual';

import axios from 'axios';
import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {
    type AccountUsageListDiffAction,
    type AccountUsageListDiffDataParams,
    type AccountsUsageDiffDataResponse,
} from '../../../store/reducers/accounts/usage/accounts-usage-list-diff';
import {getFilterParameters, normalizeTimestamp} from './account-usage';
import {
    ACCOUNTS_USAGE_LIST_DIFF_FAILED,
    ACCOUNTS_USAGE_LIST_DIFF_REQUEST,
    ACCOUNTS_USAGE_LIST_DIFF_SUCCESS,
    ACCOUNTS_USAGE_TREE_DIFF_FAILED,
    ACCOUNTS_USAGE_TREE_DIFF_REQUEST,
    ACCOUNTS_USAGE_TREE_DIFF_SUCCESS,
} from '../../../constants/accounts/accounts';
import {
    selectAccountUsageListDiffRequestParams,
    selectAccountUsageTreeDiffRequestParams,
    selectAccountUsageTreePath,
    selectAccountsUsageDiffFromSnapshot,
    selectAccountsUsageDiffToSnapshot,
} from '../../../store/selectors/accounts/account-usage';
import {
    type AccountUsageTreeDiffAction,
    type AccountUsageTreeDiffData,
} from '../../reducers/accounts/usage/accounts-usage-tree-diff';
import {type AccountUsageData} from '../../reducers/accounts/usage/account-usage-types';
import {calcAccountsUsageBaseUrl} from './accounts-usage-base-url';

type UsageListThunkAction = ThunkAction<any, RootState, any, AccountUsageListDiffAction>;

function getFilterFromToTimestamps(state: RootState) {
    const from = selectAccountsUsageDiffFromSnapshot(state);
    const to = selectAccountsUsageDiffToSnapshot(state);
    if ((!from && !to) || from === to) {
        return null;
    }

    return {
        older: {timestamp: normalizeTimestamp(from)},
        newer: {timestamp: normalizeTimestamp(to)},
    };
}

export function fetchAccountUsageListDiff(): UsageListThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const timestamps = getFilterFromToTimestamps(state);

        if (!timestamps) {
            return;
        }

        const params = getFilterParameters(state);
        const requestParams: AccountUsageListDiffDataParams = {
            ...params,
            timestamps,
        };

        dispatch({
            type: ACCOUNTS_USAGE_LIST_DIFF_REQUEST,
            data: {requestParams},
        });

        return axios
            .request<AccountsUsageDiffDataResponse>({
                method: 'POST',
                url: calcAccountsUsageBaseUrl(
                    `/api/accounts-usage/${params.cluster}/get-resource-usage-diff`,
                    state,
                ),
                data: requestParams,
                withCredentials: true,
            })
            .then((response) => {
                const params = selectAccountUsageListDiffRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_LIST_DIFF_SUCCESS,
                    data: {response: response.data},
                });
            })
            .catch((error: any) => {
                const params = selectAccountUsageListDiffRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_LIST_DIFF_FAILED,
                    data: {error: error?.response?.data || error},
                });
            });
    };
}

type UsageTreeThunkAction = ThunkAction<any, RootState, any, AccountUsageTreeDiffAction>;

export function fetchAccountUsageTreeDiff(): UsageTreeThunkAction {
    return (dispatch, getState) => {
        const state = getState();

        const timestamps = getFilterFromToTimestamps(state);

        if (!timestamps) {
            return;
        }

        const params = getFilterParameters(state);
        const requestParams: AccountUsageTreeDiffData['requestParams'] = {
            ...params,
            timestamps,
            row_filter: {
                ...params.row_filter,
                base_path: selectAccountUsageTreePath(state),
            },
        };

        dispatch({
            type: ACCOUNTS_USAGE_TREE_DIFF_REQUEST,
            data: {requestParams},
        });

        return axios
            .request<AccountUsageData>({
                method: 'POST',
                url: calcAccountsUsageBaseUrl(
                    `/api/accounts-usage/${params.cluster}/get-children-and-resource-usage-diff`,
                    state,
                ),
                data: requestParams,
                withCredentials: true,
            })
            .then((response) => {
                const params = selectAccountUsageTreeDiffRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_TREE_DIFF_SUCCESS,
                    data: {
                        response: response.data,
                        base_path: requestParams.row_filter.base_path,
                    },
                });
            })
            .catch((error: any) => {
                const params = selectAccountUsageTreeDiffRequestParams(getState());
                if (!isEqual_(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_TREE_DIFF_FAILED,
                    data: {error: error?.response?.data || error},
                });
            });
    };
}
