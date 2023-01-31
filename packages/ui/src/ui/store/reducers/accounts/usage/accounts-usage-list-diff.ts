import {ActionD, YTError} from '../../../../types';
import {
    ACCOUNTS_USAGE_LIST_DIFF_FAILED,
    ACCOUNTS_USAGE_LIST_DIFF_REQUEST,
    ACCOUNTS_USAGE_LIST_DIFF_SUCCESS,
} from '../../../../constants/accounts/accounts';
import {AccountUsageData, AccountUsageDataParams} from './account-usage-types';

export interface AccountUsageListDiffData {
    loading?: boolean;
    loaded?: boolean;
    error?: YTError;

    requestParams?: AccountUsageListDiffDataParams;
    response?: AccountsUsageDiffDataResponse;
}

export interface AccountUsageListDiffDataParams extends AccountUsageDataParams {
    timestamps: {
        older: {
            timestamp: number;
        };
        newer: {
            timestamp: number;
        };
    };
}

export interface AccountsUsageDiffDataResponse extends AccountUsageData {
    snapshot_timestamp: number;
}

const initialState: AccountUsageListDiffData = {};

export default function reducer(state = initialState, action: AccountUsageListDiffAction) {
    switch (action.type) {
        case ACCOUNTS_USAGE_LIST_DIFF_REQUEST:
            return {...state, ...action.data, loading: true, loaded: false};
        case ACCOUNTS_USAGE_LIST_DIFF_SUCCESS:
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        case ACCOUNTS_USAGE_LIST_DIFF_FAILED:
            return {...state, ...action.data, loading: false, loaded: false};
    }
    return state;
}

export type AccountUsageListDiffAction =
    | ActionD<
          typeof ACCOUNTS_USAGE_LIST_DIFF_REQUEST,
          Pick<Required<AccountUsageListDiffData>, 'requestParams'>
      >
    | ActionD<typeof ACCOUNTS_USAGE_LIST_DIFF_SUCCESS, Pick<AccountUsageListDiffData, 'response'>>
    | ActionD<
          typeof ACCOUNTS_USAGE_LIST_DIFF_FAILED,
          Pick<Required<AccountUsageListDiffData>, 'error'>
      >;
