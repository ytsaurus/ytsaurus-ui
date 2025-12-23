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

export const flowComputationParams: typeof flowParams = {
    ...flowParams,
    partition: {
        stateKey: 'flow.filters.partitionIdFilter',
        initialState: filtersInitialState.partitionIdFilter,
    },
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
    partition: {
        stateKey: 'flow.filters.partitionIdFilter',
        initialState: filtersInitialState.partitionIdFilter,
    },
};

export const flowWorkerMonitorParams: typeof flowParams = {
    ...flowParams,
    ...prometheusDashboardParams,
};
