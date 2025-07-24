import {combineReducers} from 'redux';

import {filters} from './filters';
import {dynamicSpec, staticSpec} from './specs';
import {status} from './status';
import {layout} from './layout';

export const flow = combineReducers({
    filters,
    dynamicSpec,
    staticSpec,
    status,
    layout,
});
