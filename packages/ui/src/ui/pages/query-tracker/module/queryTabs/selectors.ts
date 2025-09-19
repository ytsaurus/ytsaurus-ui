import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {getQueryId} from '../query/selectors';
import {parseResultTabIndex} from '../../QueryResults/helpers/parseResultTabIndex';

export const selectQueryResultTabs = (state: RootState) => state.queryTracker.tabs.tabs;
export const selectActiveQueryResultTab = (state: RootState) => state.queryTracker.tabs.activeTabId;
export const selectUserChangedQueryResultTab = (state: RootState) =>
    state.queryTracker.tabs.userChangeTab;

export const selectActiveResultParams = createSelector(
    [selectActiveQueryResultTab, getQueryId],
    (activeTabId, id) => {
        if (!id || !activeTabId?.includes('result')) return undefined;

        return {
            queryId: id,
            resultIndex: parseResultTabIndex(activeTabId) || 0,
        };
    },
);
