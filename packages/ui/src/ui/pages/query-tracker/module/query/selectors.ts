import {RootState} from '../../../../store/reducers';

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
    return Boolean(queryItem?.id);
};

export const getCurrentQuery = (state: RootState) => getState(state).queryItem;
