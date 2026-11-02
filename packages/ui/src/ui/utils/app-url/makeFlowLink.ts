import {stateToParams} from 'redux-location-state/lib/stateToParams';

import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';
import {
    type FlowStateFiltersValue,
    FlowTab,
    type FlowTabType,
} from '../../store/reducers/flow/filters';
import {flowComputationStateParams, flowStateParams} from '../../store/reducers/flow/url-mapping';

type Params = {
    path: string;
    cluster?: string;
    tab?: FlowTabType;
    computation?: string;
    partition?: string;
    partitionIdFilter?: string;
    worker?: string;
};

const makeFlowComputationPath = ({
    cluster,
    computation,
}: {
    cluster?: string;
    computation: string;
}): string =>
    `/${cluster || YT.cluster}/${Page.FLOWS}/${FlowTab.COMPUTATIONS}/${encodeURIComponent(computation)}`;

export const makeFlowComputationTabLink = ({
    cluster,
    computation,
    tab,
}: {
    cluster?: string;
    computation: string;
    tab: string;
}): string => `${makeFlowComputationPath({cluster, computation})}/${tab}`;

export const makeFlowLink = ({
    path,
    cluster,
    tab = FlowTab.GRAPH,
    computation,
    partition,
    partitionIdFilter,
    worker,
}: Params): string => {
    let pathname = `/${cluster || YT.cluster}/${Page.FLOWS}/${tab}`;

    const params = new URLSearchParams({path});

    if (tab === FlowTab.COMPUTATIONS && computation) {
        pathname = makeFlowComputationPath({cluster, computation});
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
};

export function makeFlowStateLink({
    cluster,
    path,
    computation,
    filters = {},
}: {
    cluster?: string;
    path: string;
    computation?: string;
    filters?: Partial<FlowStateFiltersValue>;
}): string {
    const pathname = computation
        ? makeFlowComputationTabLink({cluster, computation, tab: 'state'})
        : `/${cluster || YT.cluster}/${Page.FLOWS}/state`;
    const {location} = stateToParams(
        {[pathname]: computation ? flowComputationStateParams : flowStateParams},
        {flow: {filters: {pipelinePath: path, stateViewer: filters}}},
        {pathname, search: ''},
    );
    return `${pathname}${location.search}`;
}
