import ypath from '../../common/thor/ypath';

import {Page} from '../../constants';
import {AccountsTab, ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {AccountSelector} from '../../store/selectors/accounts/accounts-ts';

export function genAccountsAclLink(cluster: string, account: string) {
    return `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.ACL}?account=${account}`;
}

export function isTopLevelAccount(account: AccountSelector) {
    const parent = ypath.getValue(account, '/@parent_name');
    return !parent || parent === ROOT_ACCOUNT_NAME;
}
