import {combineReducers} from 'redux';

import list from './list';
import listFilters from './list-filters';

export const chyt = combineReducers({list, listFilters});
