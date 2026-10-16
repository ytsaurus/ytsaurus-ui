import {Page} from '../../../shared/constants/settings';
import {AccountsTab} from '../../constants/accounts/accounts';
import {YT} from '../../config/yt-config';

export const makeAccountsUrl = (account: string, cluster?: string): string => {
    return `/${cluster || YT.cluster}/${Page.ACCOUNTS}?account=${account}`;
};

export const makeAccountsGeneralUrl = (cluster: string): string => {
    return `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}`;
};
