import {combineReducers} from 'redux';

import {filters} from './filters';
import {staticSpec} from './specs';

export const flow = combineReducers({filters, staticSpec});
