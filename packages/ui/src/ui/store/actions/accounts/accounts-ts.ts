import map_ from 'lodash/map';

import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../constants/accounts';
import {parseAccountData} from '../../../utils/accounts/accounts-selector';

type AccountsThunkAction = ThunkAction<any, RootState, any, any>;

interface AccountListItem {
    $value: string;
    $attributes?: {
        abc?: unknown;
        parent_name?: string;
    };
}

/**
 * see persistentState from src/ui/store/reducers/accounts/accounts/index.js
 * TODO: Get rid of this interface when the file is Rewritten with typescript
 */
export interface AccountsStateDataFields {
    masterMemoryContentMode?: 'total' | 'detailed' | 'chunk_host' | 'per_cell';
}

export function setAccountsStateDataFields(
    data: Partial<AccountsStateDataFields>,
): AccountsThunkAction {
    return (dispatch) => {
        dispatch({type: ACCOUNTS_DATA_FIELDS_ACTION, data});
    };
}

export function parseAccountsData(data: Array<unknown>) {
    return Promise.all(map_(data, (item) => Promise.resolve(parseAccountData(item))));
}

export async function parseAccountsListData(data: Array<unknown>) {
    return map_(data, (value) => {
        const item = value as AccountListItem;
        const attributes = item.$attributes || {};
        const name = item.$value;

        return {
            $value: name,
            name,
            $attributes: attributes,
            abc: attributes.abc || {},
            parent: attributes.parent_name,
            responsibleUsers: [],
            hasRecursiveResources: false,
            recursiveResources: {},
            perMedium: {},
            alertsCount: 0,
        };
    });
}
