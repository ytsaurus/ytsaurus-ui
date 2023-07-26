import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {QTRequestOptions, QueryStatus} from '../api';
import {
    getSettingQueryTrackerStage,
    getSettingQueryTrackerYQLAgentStage,
} from '../../../../store/selectors/settings-ts';
import {getQueryTrackerStage} from '../../../../config';

const QT_STAGE = getQueryTrackerStage();
const getState = (state: RootState) => state.queryTracker.query;

export const getQuery = (state: RootState) => getState(state).queryItem;
export const getQueryGetParams = (state: RootState) => getState(state).params;

export const getQueryDraft = (state: RootState) => getState(state).draft;

export const getQueryText = (state: RootState) => getState(state).draft.query;

export const getQueryEngine = (state: RootState) => getState(state).draft.engine;

export const isQueryLoading = (state: RootState) => getState(state).state === 'loading';

export const isQueryExecuted = (state: RootState): boolean => {
    const queryItem = getState(state).queryItem;
    // TODO: Use real query's state
    return Boolean(queryItem?.id) && queryItem?.state !== QueryStatus.DRAFT;
};

export const getCurrentQuery = (state: RootState) => getState(state).queryItem;

export const isQueryDraftEditted = createSelector([getQuery, getQueryDraft], (query, draft) => {
    return query?.query !== draft.query;
});

export const hasLoadedQueryItem = (state: RootState) => {
    const queryItem = getState(state).queryItem;
    return Boolean(queryItem?.id);
};

export const getQueryTrackerRequestOptions = createSelector(
    [getSettingQueryTrackerStage, getSettingQueryTrackerYQLAgentStage],
    (stage, yqlAgentStage) => {
        const res: QTRequestOptions = {
            stage: stage || QT_STAGE,
            yqlAgentStage,
        };
        return res;
    },
);
