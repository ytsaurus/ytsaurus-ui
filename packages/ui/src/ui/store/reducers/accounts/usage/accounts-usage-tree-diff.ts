import {ActionD, YTError} from '../../../../types';
import {
    ACCOUNTS_USAGE_TREE_DIFF_REQUEST,
    ACCOUNTS_USAGE_TREE_DIFF_SUCCESS,
    ACCOUNTS_USAGE_TREE_DIFF_FAILED,
} from '../../../../constants/accounts/accounts';
import {AccountUsageListDiffDataParams} from './accounts-usage-list-diff';
import {AccountUsageData} from './account-usage-types';

export interface AccountUsageTreeDiffData {
    loading?: boolean;
    loaded?: boolean;
    error?: YTError;

    requestParams?: AccountUsageTreeDiffDataParams;
    response?: AccountUsageData;

    // do not remove it, the field is used as removable prefix for visible rows
    base_path: string;
}

type AccountUsageTreeDiffDataParams = AccountUsageListDiffDataParams & {
    row_filter: {
        base_path: string;
    };
};

const initialState: AccountUsageTreeDiffData = {
    base_path: '',
};

export default function reducer(state = initialState, action: AccountUsageTreeDiffAction) {
    switch (action.type) {
        case ACCOUNTS_USAGE_TREE_DIFF_REQUEST:
            return {...state, ...action.data, loading: true, loaded: false};
        case ACCOUNTS_USAGE_TREE_DIFF_SUCCESS:
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        case ACCOUNTS_USAGE_TREE_DIFF_FAILED:
            return {...state, ...action.data, loading: false, loaded: false};
    }
    return state;
}

export type AccountUsageTreeDiffAction =
    | ActionD<
          typeof ACCOUNTS_USAGE_TREE_DIFF_REQUEST,
          Pick<AccountUsageTreeDiffData, 'requestParams'>
      >
    | ActionD<typeof ACCOUNTS_USAGE_TREE_DIFF_SUCCESS, Pick<AccountUsageTreeDiffData, 'response'>>
    | ActionD<
          typeof ACCOUNTS_USAGE_TREE_DIFF_FAILED,
          Pick<Partial<AccountUsageTreeDiffData>, 'error'>
      >;
