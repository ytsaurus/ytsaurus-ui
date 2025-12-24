import {LocationParameters} from '../../../store/location';
import {prometheusDashboardParams} from '../../../store/reducers/prometheusDashboard/url-mapping';
import {initialState as filtersInitialState} from './filters';

export const flowParams: LocationParameters = {
    path: {
        stateKey: 'flow.filters.pipelinePath',
        initialState: filtersInitialState.pipelinePath,
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

export const flowWorkdersParams: typeof flowParams = {
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
