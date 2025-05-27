import {combineReducers} from 'redux';

import {filters} from './filters';
import {dynamicSpec, staticSpec} from './specs';
import {status} from './status';
import {layout} from './layout';
import {flowGraphSlice} from './graph';

export const flow = combineReducers({
    filters,
    dynamicSpec,
    staticSpec,
    status,
    layout,
    graph: flowGraphSlice.reducer,
});
