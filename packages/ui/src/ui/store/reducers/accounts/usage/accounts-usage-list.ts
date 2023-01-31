import {ActionD, YTError} from '../../../../types';
import {
    ACCOUNTS_USAGE_LIST_FAILED,
    ACCOUNTS_USAGE_LIST_REQUEST,
    ACCOUNTS_USAGE_LIST_SUCCESS,
} from '../../../../constants/accounts/accounts';
import {AccountUsageData, AccountUsageDataParams} from './account-usage-types';

export interface AccountUsageListData {
    loading?: boolean;
    loaded?: boolean;
    error?: YTError;

    requestParams?: AccountUsageListDataParams;
    response?: AccountsUsageDataResponse;
}

export interface AccountUsageListDataParams extends AccountUsageDataParams {
    timestamp: number;
}

export interface AccountsUsageDataResponse extends AccountUsageData {
    snapshot_timestamp: number;
}

const initialState: AccountUsageListData = {};

export default function reducer(state = initialState, action: AccountUsageListAction) {
    switch (action.type) {
        case ACCOUNTS_USAGE_LIST_REQUEST:
            return {...state, ...action.data, loading: true, loaded: false};
        case ACCOUNTS_USAGE_LIST_SUCCESS:
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        case ACCOUNTS_USAGE_LIST_FAILED:
            return {...state, ...action.data, loading: false, loaded: false};
    }
    return state;
}

export type AccountUsageListAction =
    | ActionD<
          typeof ACCOUNTS_USAGE_LIST_REQUEST,
          Pick<Required<AccountUsageListData>, 'requestParams'>
      >
    | ActionD<typeof ACCOUNTS_USAGE_LIST_SUCCESS, Pick<AccountUsageListData, 'response'>>
    | ActionD<typeof ACCOUNTS_USAGE_LIST_FAILED, Pick<Required<AccountUsageListData>, 'error'>>;
