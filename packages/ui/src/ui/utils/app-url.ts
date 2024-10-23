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

export function makeNavigationLink({
    path,
    cluster,
    navmode,
}: {
    path: string;
    cluster?: string;
    navmode?: ValueOf<typeof NavigationTab>;
}) {
    const res = `/${cluster || YT.cluster}/${Page.NAVIGATION}?path=${path}`;
    return navmode ? `${res}&navmode=${navmode}` : res;
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
