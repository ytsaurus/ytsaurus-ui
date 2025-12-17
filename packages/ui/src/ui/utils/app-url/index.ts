import {Page} from '../../../shared/constants/settings';
import {Tab as ComponentsTab} from '../../constants/components/main';
import {YT} from '../../config/yt-config';
import {FlowTab, FlowTabType} from '../../store/reducers/flow/filters';

export * from './navigation';

export function makeComponentsNodesUrl({host, cluster}: {host?: string; cluster?: string} = {}) {
    return host
        ? `/${cluster || YT.cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}/${host}`
        : `/${cluster || YT.cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}`;
}

export function makeProxyUrl(cluster: string, address: string) {
    return `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.RPC_PROXIES}?host=${address}`;
}

export function makeSchedulingUrl({
    pool,
    poolTree,
    cluster,
    tab,
}: {
    pool: string;
    poolTree: string;
    cluster?: string;
    tab?: 'attributes';
}) {
    const path = [cluster || YT.cluster, Page.SCHEDULING, tab].filter(Boolean).join('/');
    return `/${path}?pool=${pool}&poolTree=${poolTree}`;
}

export function makeAccountsUrl(account: string, cluster?: string) {
    return `/${cluster || YT.cluster}/${Page.ACCOUNTS}?account=${account}`;
}

export function makeBundleUrl({bundle, cluster}: {bundle: string; cluster?: string}) {
    return `/${cluster || YT.cluster}/${Page.TABLET_CELL_BUNDLES}/instances?activeBundle=${bundle}`;
}

export function makeFlowLink({
    path,
    cluster,
    tab = FlowTab.GRAPH,
    computation,
    partitionIdFilter,
}: {
    path: string;
    cluster?: string;
    tab?: FlowTabType;
    computation?: string;
    partitionIdFilter?: string;
}) {
    let pathname = `/${cluster || YT.cluster}/${Page.FLOWS}/${tab}`;

    const params = new URLSearchParams({path});

    if (tab === FlowTab.COMPUTATIONS && computation) {
        pathname += `/${encodeURIComponent(computation)}`;
        if (partitionIdFilter) {
            params.append('partition', partitionIdFilter);
        }
    }

    return `${pathname}?${params}`;
}
