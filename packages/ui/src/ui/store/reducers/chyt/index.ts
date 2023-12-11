import {combineReducers} from 'redux';

import list from './list';
import listFilters from './list-filters';
import clique from './clique';
import options from './options';
import speclet from './speclet';

export const chyt = combineReducers({list, listFilters, clique, options, speclet});
