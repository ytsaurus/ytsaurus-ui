import {type LocationParameters, type PathParameters} from '../../../store/location';
import {Page} from '../../../constants/index';
import {prometheusDashboardParams} from '../../../store/reducers/prometheusDashboard/url-mapping';
import {FlowTab, initialState as filtersInitialState} from './filters';

export const flowParams: LocationParameters = {
    path: {
        stateKey: 'flow.filters.pipelinePath',
        initialState: filtersInitialState.pipelinePath,
    },
};

export const flowGraphParams: typeof flowParams = {
    ...flowParams,
    name: {
        stateKey: 'flow.filters.zoomToNode',
        initialState: filtersInitialState.zoomToNode,
    },
};

export const flowComputationsParams: typeof flowParams = {
    ...flowParams,
    name: {
        stateKey: 'flow.filters.computationsNameFilter',
        initialState: filtersInitialState.computationsNameFilter,
    },
};

export const flowComputationMonitorParams: typeof flowParams = {
    ...flowParams,
    ...prometheusDashboardParams,
};

const flowPartitionsFilters: typeof flowParams = {
    partition: {
        stateKey: 'flow.filters.partitionIdFilter',
        initialState: filtersInitialState.partitionIdFilter,
    },
    jobState: {
        stateKey: 'flow.filters.partitionsJobStateFilter',
        initialState: filtersInitialState.partitionsJobStateFilter,
        type: 'array',
    },
    state: {
        stateKey: 'flow.filters.partitionsStateFilter',
        initialState: filtersInitialState.partitionsStateFilter,
        type: 'array',
    },
};

export const flowComputationParams: typeof flowParams = {
    ...flowParams,
    ...flowPartitionsFilters,
};

export const flowWorkersParams: typeof flowParams = {
    ...flowParams,
    name: {
        stateKey: 'flow.filters.workersNameFilter',
        initialState: filtersInitialState.workersNameFilter,
    },
};

export const flowPartitionParams: typeof flowParams = {
    ...flowParams,
};

export const flowWorkerParams: typeof flowParams = {
    ...flowParams,
    ...flowPartitionsFilters,
};

export const flowWorkerMonitorParams: typeof flowParams = {
    ...flowParams,
    ...prometheusDashboardParams,
};

const flowStateViewerFilters: LocationParameters = {
    statePartition: {
        stateKey: 'flow.filters.stateViewerPartition',
        initialState: filtersInitialState.stateViewerPartition,
    },
    stateKind: {
        stateKey: 'flow.filters.stateViewerTarget',
        initialState: filtersInitialState.stateViewerTarget,
    },
    stateName: {
        stateKey: 'flow.filters.stateViewerName',
        initialState: filtersInitialState.stateViewerName,
    },
    stateKey: {
        stateKey: 'flow.filters.stateViewerKeyText',
        initialState: filtersInitialState.stateViewerKeyText,
    },
};

export const flowPipelineStateParams: typeof flowParams = {
    ...flowParams,
    stateComputation: {
        stateKey: 'flow.filters.stateViewerComputation',
        initialState: filtersInitialState.stateViewerComputation,
    },
    ...flowStateViewerFilters,
};

export const flowComputationStateParams: typeof flowParams = {
    ...flowComputationParams,
    ...flowStateViewerFilters,
    heavyHitterSeed: {
        stateKey: 'flow.filters.stateViewerHeavyHitterSeed',
        initialState: filtersInitialState.stateViewerHeavyHitterSeed,
    },
};

export const FLOW_PIPELINE_STATE_PATH = `/*/${Page.FLOWS}/state`;
export const FLOW_COMPUTATION_STATE_PATH = `/*/${Page.FLOWS}/${FlowTab.COMPUTATIONS}/*/state`;

export const flowStateLocations: Array<[string, PathParameters]> = [
    [FLOW_COMPUTATION_STATE_PATH, [flowComputationStateParams]],
    [FLOW_PIPELINE_STATE_PATH, [flowPipelineStateParams]],
];

export type FlowStateRoute = 'pipeline' | 'computation';

export function isFlowStatePathname(pathname: string): FlowStateRoute | undefined {
    const segments = pathname.split('/');
    if (segments.length === 4 && segments[2] === Page.FLOWS && segments[3] === 'state') {
        return 'pipeline';
    }
    if (
        segments.length === 6 &&
        segments[2] === Page.FLOWS &&
        segments[3] === FlowTab.COMPUTATIONS &&
        segments[5] === 'state'
    ) {
        return 'computation';
    }
    return undefined;
}
