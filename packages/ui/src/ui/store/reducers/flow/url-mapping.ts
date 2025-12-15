import {LocationParameters} from '../../../store/location';

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

export const flowWorkdersParams: typeof flowParams = {
    ...flowParams,
    name: {
        stateKey: 'flow.filters.workersNameFilter',
        initialState: filtersInitialState.workersNameFilter,
    },
};
