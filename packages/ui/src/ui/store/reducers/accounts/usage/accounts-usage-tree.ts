import {ActionD, YTError} from '../../../../types';
import {AccountUsageListDataParams, AccountsUsageDataResponse} from './accounts-usage-list';
import {
    ACCOUNTS_USAGE_TREE_FAILED,
    ACCOUNTS_USAGE_TREE_REQUEST,
    ACCOUNTS_USAGE_TREE_SUCCESS,
} from '../../../../constants/accounts/accounts';

export interface AccountUsageTreeData {
    loading?: boolean;
    loaded?: boolean;
    error?: YTError;

    requestParams?: AccountUsageTreeDataParams;
    response?: AccountsUsageDataResponse;

    // do not remove it, the field is used as removable prefix for visible rows
    base_path: string;
}

type AccountUsageTreeDataParams = AccountUsageListDataParams & {
    row_filter: {
        base_path: string;
    };
};

const initialState: AccountUsageTreeData = {
    base_path: '',
};

export default function reducer(state = initialState, action: AccountUsageTreeAction) {
    switch (action.type) {
        case ACCOUNTS_USAGE_TREE_REQUEST:
            return {...state, ...action.data, loading: true, loaded: false};
        case ACCOUNTS_USAGE_TREE_SUCCESS:
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        case ACCOUNTS_USAGE_TREE_FAILED:
            return {...state, ...action.data, loading: false, loaded: false};
    }
    return state;
}

export type AccountUsageTreeAction =
    | ActionD<typeof ACCOUNTS_USAGE_TREE_REQUEST, Pick<AccountUsageTreeData, 'requestParams'>>
    | ActionD<typeof ACCOUNTS_USAGE_TREE_SUCCESS, Pick<AccountUsageTreeData, 'response'>>
    | ActionD<typeof ACCOUNTS_USAGE_TREE_FAILED, Pick<Partial<AccountUsageTreeData>, 'error'>>;
