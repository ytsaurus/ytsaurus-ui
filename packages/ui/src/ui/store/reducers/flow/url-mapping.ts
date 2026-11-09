import {type LocationParameters} from '../../../store/location';
import {prometheusDashboardParams} from '../../../store/reducers/prometheusDashboard/url-mapping';
import {makeBase64ParseSerialize} from '../../../utils/parse-serialize';
import {initialState as filtersInitialState, normalizeFlowStateRawKey} from './filters';

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

const stateKeyValues = makeBase64ParseSerialize(filtersInitialState.stateViewer.keyValues);
const stateRawKey = makeBase64ParseSerialize(undefined);

export const flowComputationStateParams: typeof flowParams = {
    ...flowParams,
    statePartitionId: {
        stateKey: 'flow.filters.stateViewer.partitionId',
        initialState: filtersInitialState.stateViewer.partitionId,
    },
    stateName: {
        stateKey: 'flow.filters.stateViewer.stateName',
        initialState: filtersInitialState.stateViewer.stateName,
    },
    stateTarget: {
        stateKey: 'flow.filters.stateViewer.target',
        initialState: filtersInitialState.stateViewer.target,
    },
    stateKeyValues: {
        stateKey: 'flow.filters.stateViewer.keyValues',
        initialState: filtersInitialState.stateViewer.keyValues,
        options: {
            ...stateKeyValues,
            parse: (value) => {
                const parsed: unknown = stateKeyValues.parse(value);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    return filtersInitialState.stateViewer.keyValues;
                }
                return Object.fromEntries(
                    Object.entries(parsed).filter(([, entry]) => typeof entry === 'string'),
                );
            },
        },
    },
    stateRawKey: {
        stateKey: 'flow.filters.stateViewer.rawKey',
        initialState: filtersInitialState.stateViewer.rawKey,
        options: {
            parse: (value) => normalizeFlowStateRawKey(stateRawKey.parse(value)),
            serialize: (value) => stateRawKey.serialize(normalizeFlowStateRawKey(value)),
        },
    },
};

export const flowStateParams: typeof flowParams = {
    ...flowComputationStateParams,
    stateComputationId: {
        stateKey: 'flow.filters.stateViewer.computationId',
        initialState: filtersInitialState.stateViewer.computationId,
    },
};
