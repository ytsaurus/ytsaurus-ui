import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';

const getState = (state: RootState) => state.queryTracker;

export const getVisibilityQueriesListUiSetting = createSelector(
    [getState],
    (state) => state.uiSettings.showQueriesList
);
