import {combineReducers} from 'redux';
import queryList from './queryListSlice';
import {query as queryReducer} from './query';
import {queryResult as queryResultsReducer} from './queryResult';
import {queryAco as queryAcoReducer} from './queryAco';
import {queryFilesFormReducer} from './queryFilesFormSlice';
import {vcsReducer} from './vcsSlice';
import {queryNavigationReducer} from './queryNavigationSlice';
import {queryChartReducer} from './queryChartSlice';
import {queryTabsReducer} from './queryTabsSlice';

export const queryTracker = combineReducers({
    list: queryList,
    query: queryReducer,
    results: queryResultsReducer,
    aco: queryAcoReducer,
    queryFilesModal: queryFilesFormReducer,
    vcs: vcsReducer,
    queryNavigation: queryNavigationReducer,
    queryChart: queryChartReducer,
    tabs: queryTabsReducer,
});
