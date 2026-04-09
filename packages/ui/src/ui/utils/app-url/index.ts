import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';
import {Tab as ComponentsTab} from '../../constants/components/main';
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

export function makeOperationJobsUrl(params: {
    cluster?: string;
    operationId: string;
    incarnationId?: string;
    jobId?: string;
    state?: 'all' | 'running' | 'completed' | 'failed' | 'aborted';
}): string {
    const {cluster, operationId, incarnationId, jobId, state} = params;

    const pathname = `/${cluster || YT.cluster}/${Page.OPERATIONS}/${operationId}/jobs`;

    const searchParams = new URLSearchParams();

    if (incarnationId) {
        searchParams.set('incarnation', incarnationId);
    }

    if (jobId) {
        searchParams.set('jobId', jobId);
    }

    if (state) {
        searchParams.set('state', state);
    }

    return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
}

export function makeOperationJobUrl(params: {
    cluster?: string;
    operationId: string;
    jobId: string;
}): string {
    const {cluster, operationId, jobId} = params;

    return `/${cluster || YT.cluster}/${Page.JOB}/${operationId}/${jobId}`;
}

export function makeOperationLogsUrl(params: {cluster?: string; operationId: string}): string {
    const {cluster, operationId} = params;

    return `/${cluster || YT.cluster}/${Page.OPERATIONS}/${operationId}/logs`;
}

export function makeFlowLink({
    path,
    cluster,
    tab = FlowTab.GRAPH,
    computation,
    partition,
    partitionIdFilter,
    worker,
}: {
    path: string;
    cluster?: string;
    tab?: FlowTabType;
    computation?: string;
    partition?: string;
    partitionIdFilter?: string;
    worker?: string;
}) {
    let pathname = `/${cluster || YT.cluster}/${Page.FLOWS}/${tab}`;

    const params = new URLSearchParams({path});

    if (tab === FlowTab.COMPUTATIONS && computation) {
        pathname += `/${encodeURIComponent(computation)}`;
        if (partition) {
            pathname += `/partition/${encodeURIComponent(partition)}`;
        } else {
            pathname += '/details';
            if (partitionIdFilter) {
                params.append('partition', partitionIdFilter);
            }
        }
    }

    if (tab === FlowTab.WORKERS) {
        if (worker) {
            pathname += `/${encodeURIComponent(worker)}/details`;
        }
    }

    return `${pathname}?${params}`;
}
