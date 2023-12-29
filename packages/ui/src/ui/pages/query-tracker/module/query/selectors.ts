import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {QTRequestOptions, QueryStatus} from '../api';
import {
    getSettingQueryTrackerStage,
    getSettingQueryTrackerYQLAgentStage,
} from '../../../../store/selectors/settings-ts';
import {getQueryTrackerStage} from '../../../../config';
import {QTEditorError} from '../types/editor';
import {YTError} from '../../../../types';
import {isYTError} from '../../../../../shared/utils';
import {getQueryResults} from '../query_result/selectors';
import forOwn_ from 'lodash/forOwn';

const QT_STAGE = getQueryTrackerStage();
const getState = (state: RootState) => state.queryTracker.query;

const DEFAULT_QUERY_ACO = 'nobody';
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

export const getQueryEditorErrors = (state: RootState): QTEditorError[] => {
    const res: QTEditorError[] = [];
    const checkIsEditorError = (error: YTError) => {
        if (error.attributes) {
            if ('end_position' in error.attributes && 'start_position' in error.attributes) {
                res.push(error as QTEditorError);
            }
        }
        if (error.inner_errors && error.inner_errors.length !== 0) {
            error.inner_errors.forEach((inner_error) => checkIsEditorError(inner_error));
        }
    };

    const {error, id} = getState(state).draft;
    if (isYTError(error)) {
        checkIsEditorError(error);
    }
    if (id && !isQueryDraftEditted(state)) {
        const results = getQueryResults(state, id);
        if (results) {
            forOwn_(results, (value) => {
                if (value.state === 'error' && isYTError(value.error)) {
                    checkIsEditorError(value.error);
                }
            });
        }
    }

    return res;
};

export const getDirtySinceLastSubmit = (state: RootState) =>
    state.queryTracker.query.dirtySinceLastSubmit;

export const getCurrentQueryACO = (state: RootState) =>
    state.queryTracker.query?.queryItem?.access_control_object || DEFAULT_QUERY_ACO;

export const getCurrentDraftQueryACO = (state: RootState) =>
    state.queryTracker.query?.draft?.access_control_object || DEFAULT_QUERY_ACO;

export const getLoadedQueryItemId = (state: RootState) => {
    const queryItem = getState(state).queryItem;
    return queryItem?.id;
};
