import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

export const makeAccountsUrl = (account: string, cluster?: string): string => {
    return `/${cluster || YT.cluster}/${Page.ACCOUNTS}?account=${account}`;
};
