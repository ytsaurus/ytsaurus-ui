import {Page} from '../../constants';
import {AccountsTab} from '../../constants/accounts/accounts';

export function genAccountsAclLink(cluster: string, account: string) {
    return `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.ACL}?account=${account}`;
}
