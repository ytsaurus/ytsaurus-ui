import keyBy_ from 'lodash/keyBy';

import {type AccountParsedData} from '../../../utils/accounts/accounts-selector';
import {prepareAccountsTree} from '../../../utils/accounts/accounts-tree';
import {parseAccountsDataSync} from '../../../store/actions/accounts/accounts-ts';
import Account from '../selector';
import {type AccountTreeYsonNode, accountTreeYsonToList} from './accountTreeYsonToList';

export type AccountEditorAccount = InstanceType<typeof Account> & AccountParsedData;

export function prepareAccountEditorData(topLevel: string, response: AccountTreeYsonNode) {
    const parsedAccounts = parseAccountsDataSync(accountTreeYsonToList(topLevel, response));
    const accounts = parsedAccounts.map((account) => new Account(account) as AccountEditorAccount);
    const accountsByName = keyBy_(accounts, ({name}) => name);

    return {
        accounts,
        accountsByName,
        tree: prepareAccountsTree(accountsByName),
    };
}
