import {Page} from '../../shared/constants/settings';
import {Tab as ComponentsTab} from '../constants/components/main';
import YT from '../config/yt-config';

export function makeNodeUrl(cluster: string, address: string) {
    return `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}/${address}`;
}

export function makeProxyUrl(cluster: string, address: string) {
    return `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.RPC_PROXIES}?host=${address}`;
}

export function makeNavigationLink(path: string, cluster?: string) {
    return `/${cluster || YT.cluster}/${Page.NAVIGATION}?path=${path}`;
}

export function makeSchedulingUrl({
    pool,
    poolTree,
    cluster,
}: {
    pool: string;
    poolTree: string;
    cluster?: string;
}) {
    return `/${cluster || YT.cluster}/${Page.SCHEDULING}?pool=${pool}&poolTree=${poolTree}`;
}

export function makeAccountsUrl(account: string, cluster?: string) {
    return `/${cluster || YT.cluster}/${Page.ACCOUNTS}?account=${account}`;
}
