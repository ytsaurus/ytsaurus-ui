import {Page} from '../../../shared/constants/settings';
import {Tab as ComponentsTab} from '../../constants/components/main';

export const makeProxyUrl = (cluster: string, address: string): string => {
    return `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.RPC_PROXIES}?host=${address}`;
};
