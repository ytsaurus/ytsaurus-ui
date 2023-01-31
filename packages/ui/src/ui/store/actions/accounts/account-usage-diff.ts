import _ from 'lodash';
import axios from 'axios';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {
    AccountsUsageDiffDataResponse,
    AccountUsageListDiffAction,
    AccountUsageListDiffDataParams,
} from '../../../store/reducers/accounts/usage/accounts-usage-list-diff';
import {accountUsageApiUrl, getFilterParameters} from './account-usage';
import {
    ACCOUNTS_USAGE_LIST_DIFF_FAILED,
    ACCOUNTS_USAGE_LIST_DIFF_REQUEST,
    ACCOUNTS_USAGE_LIST_DIFF_SUCCESS,
    ACCOUNTS_USAGE_TREE_DIFF_FAILED,
    ACCOUNTS_USAGE_TREE_DIFF_REQUEST,
    ACCOUNTS_USAGE_TREE_DIFF_SUCCESS,
} from '../../../constants/accounts/accounts';
import {
    getAccountsUsageDiffFromSnapshot,
    getAccountsUsageDiffToSnapshot,
    getAccountUsageListDiffRequestParams,
    getAccountUsageTreeDiffRequestParams,
    getAccountUsageTreePath,
} from '../../../store/selectors/accounts/account-usage';
import {
    AccountUsageTreeDiffAction,
    AccountUsageTreeDiffData,
} from '../../reducers/accounts/usage/accounts-usage-tree-diff';
import {AccountUsageData} from '../../reducers/accounts/usage/account-usage-types';

type UsageListThunkAction = ThunkAction<any, RootState, any, AccountUsageListDiffAction>;

function getFilterFromToTimestamps(state: RootState) {
    const from = getAccountsUsageDiffFromSnapshot(state);
    const to = getAccountsUsageDiffToSnapshot(state);
    if ((!from && !to) || from === to) {
        return null;
    }

    return {
        older: {timestamp: from || Date.now() / 1000},
        newer: {timestamp: to || Date.now() / 1000},
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
                url: accountUsageApiUrl('get-resource-usage-diff'),
                data: requestParams,
                withCredentials: true,
            })
            .then((response) => {
                const params = getAccountUsageListDiffRequestParams(getState());
                if (!_.isEqual(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_LIST_DIFF_SUCCESS,
                    data: {response: response.data},
                });
            })
            .catch((error: any) => {
                const params = getAccountUsageListDiffRequestParams(getState());
                if (!_.isEqual(params, requestParams)) {
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
                base_path: getAccountUsageTreePath(state),
            },
        };

        dispatch({
            type: ACCOUNTS_USAGE_TREE_DIFF_REQUEST,
            data: {requestParams},
        });

        return axios
            .request<AccountUsageData>({
                method: 'POST',
                url: accountUsageApiUrl('get-children-and-resource-usage-diff'),
                data: requestParams,
                withCredentials: true,
            })
            .then((response) => {
                const params = getAccountUsageTreeDiffRequestParams(getState());
                if (!_.isEqual(params, requestParams)) {
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
                const params = getAccountUsageTreeDiffRequestParams(getState());
                if (!_.isEqual(params, requestParams)) {
                    return;
                }

                dispatch({
                    type: ACCOUNTS_USAGE_TREE_DIFF_FAILED,
                    data: {error: error?.response?.data || error},
                });
            });
    };
}
