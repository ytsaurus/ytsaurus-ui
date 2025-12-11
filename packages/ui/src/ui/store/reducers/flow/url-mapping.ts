import {LocationParameters} from '../../../store/location';

import {initialState as filtersInitialState} from './filters';

export const flowParams: LocationParameters = {
    path: {
        stateKey: 'flow.filters.pipelinePath',
        initialState: filtersInitialState.pipelinePath,
    },
};
