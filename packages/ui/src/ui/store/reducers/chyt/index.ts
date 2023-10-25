import {combineReducers} from 'redux';

import list from './list';
import listFilters from './list-filters';
import clique from './clique';

export const chyt = combineReducers({list, listFilters, clique});
