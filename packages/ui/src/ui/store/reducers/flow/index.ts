import {combineReducers} from 'redux';

import {filters} from './filters';
import {dynamicSpec, staticSpec} from './specs';
import {status} from './status';

export const flow = combineReducers({filters, dynamicSpec, staticSpec, status});
