import {combineReducers} from 'redux';

import {filters} from './filters';
import {staticSpec} from './specs';
import {status} from './status';

export const flow = combineReducers({filters, staticSpec, status});
