import _ from 'lodash';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../constants/accounts';
import {parseAccountData} from '../../../utils/accounts/accounts-selector';

type AccountsThunkAction = ThunkAction<any, RootState, any, any>;

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
    return Promise.all(_.map(data, (item) => Promise.resolve(parseAccountData(item))));
}
