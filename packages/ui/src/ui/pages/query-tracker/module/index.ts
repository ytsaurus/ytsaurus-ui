import {combineReducers} from 'redux';
import {reducer as listReducer} from './queries_list/reducer';
import {reducer as queryReducer} from './query/reducer';
import {reducer as queryResultsReducer} from './query_result/reducer';
import {reducer as queryAcoReducer} from './query_aco/reducer';
import {queryFilesFormReducer} from './queryFilesForm/queryFilesFormSlice';
import {vcsReducer} from './vcs/vcsSlice';
import {queryNavigationReducer} from './queryNavigation/queryNavigationSlice';

export const queryTracker = combineReducers({
    list: listReducer,
    query: queryReducer,
    results: queryResultsReducer,
    aco: queryAcoReducer,
    queryFilesModal: queryFilesFormReducer,
    vcs: vcsReducer,
    queryNavigation: queryNavigationReducer,
});
