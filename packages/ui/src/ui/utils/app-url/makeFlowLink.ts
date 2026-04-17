import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';
import {FlowTab, type FlowTabType} from '../../store/reducers/flow/filters';

type Params = {
    path: string;
    cluster?: string;
    tab?: FlowTabType;
    computation?: string;
    partition?: string;
    partitionIdFilter?: string;
    worker?: string;
};

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
};
