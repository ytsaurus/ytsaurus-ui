import {Page} from '../../shared/constants/settings';
import {Tab as ComponentsTab} from '../constants/components/main';
import YT from '../config/yt-config';
import type {Tab as NavigationTab} from '../constants/navigation';
import {ValueOf} from '../types';

export function makeComponentsNodesUrl({host, cluster}: {host?: string; cluster?: string} = {}) {
    return host
        ? `/${cluster || YT.cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}/${host}`
        : `/${cluster || YT.cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}`;
}

export function makeProxyUrl(cluster: string, address: string) {
    return `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.RPC_PROXIES}?host=${address}`;
}

export function makeNavigationLink(params: {
    path: string;
    cluster?: string;
    navmode?: ValueOf<typeof NavigationTab>;
    teMode?: 'request_errors';
}) {
    const {cluster, ...rest} = params;
    const res = `/${cluster || YT.cluster}/${Page.NAVIGATION}`;
    const search = new URLSearchParams(rest).toString();
    return search ? `${res}?${search}` : res;
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
