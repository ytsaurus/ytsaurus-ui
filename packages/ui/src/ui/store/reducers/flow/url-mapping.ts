import {LocationParameters} from '../../../store/location';

import {initialState as filtersInitialState} from './filters';

export const flowParams: LocationParameters = {
    mode: {
        stateKey: 'flow.filters.flowViewMode',
        initialState: filtersInitialState.flowViewMode,
    },
    path: {
        stateKey: 'flow.filters.pipelinePath',
        initialState: filtersInitialState.pipelinePath,
    },
};
