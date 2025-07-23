import {combineReducers} from 'redux';
import queryList from './queries_list/queryListSlice';
import {reducer as queryReducer} from './query/reducer';
import {reducer as queryResultsReducer} from './query_result/reducer';
import {reducer as queryAcoReducer} from './query_aco/reducer';
import {queryFilesFormReducer} from './queryFilesForm/queryFilesFormSlice';
import {vcsReducer} from './vcs/vcsSlice';
import {queryNavigationReducer} from './queryNavigation/queryNavigationSlice';
import {queryChartReducer} from './queryChart/queryChartSlice';

export const queryTracker = combineReducers({
    list: queryList,
    query: queryReducer,
    results: queryResultsReducer,
    aco: queryAcoReducer,
    queryFilesModal: queryFilesFormReducer,
    vcs: vcsReducer,
    queryNavigation: queryNavigationReducer,
    queryChart: queryChartReducer,
});
