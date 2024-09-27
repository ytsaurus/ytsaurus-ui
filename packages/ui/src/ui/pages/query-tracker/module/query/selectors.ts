import forOwn_ from 'lodash/forOwn';
import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {DraftQuery, QTRequestOptions, QueryItem, QueryStatus} from '../api';
import {
    getSettingQueryTrackerStage,
    getSettingQueryTrackerYQLAgentStage,
} from '../../../../store/selectors/settings-ts';
import {getQueryTrackerStage} from '../../../../config';
import {QTEditorError} from '../types/editor';
import {YTError} from '../../../../types';
import {isYTError} from '../../../../../shared/utils';
import {getQueryResults} from '../query_result/selectors';
import {getDefaultQueryACO, selectIsMultipleAco} from '../query_aco/selectors';

const QT_STAGE = getQueryTrackerStage();
const getState = (state: RootState) => state.queryTracker.query;

export const DEFAULT_QUERY_ACO = 'nobody';
export const SHARED_QUERY_ACO = 'everyone-share';

export const getQuery = (state: RootState) => getState(state).queryItem;
export const getQueryGetParams = (state: RootState) => getState(state).params;

export const getQueryDraft = (state: RootState) => getState(state).draft;

export const getQueryFiles = (state: RootState) => getState(state).draft.files;

export const getQueryText = (state: RootState) => getState(state).draft.query;

export const getQueryEngine = (state: RootState) => getState(state).draft.engine;

export const isQueryLoading = (state: RootState) => getState(state).state === 'loading';

export const getCliqueMap = (state: RootState) => getState(state).cliqueMap;
export const getCliqueLoading = (state: RootState) => getState(state).cliqueLoading;

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
    const currentQuery = getCurrentQuery(state);
    if (currentQuery && currentQuery.error) {
        checkIsEditorError(currentQuery.error);
    }

    return res;
};

export const getDirtySinceLastSubmit = (state: RootState) =>
    state.queryTracker.query.dirtySinceLastSubmit;

export const getCurrentStage = (state: RootState) => {
    return state.queryTracker?.aco?.data?.query_tracker_stage ?? 'production';
};

const getAco = (
    defaultACO: string,
    isMultipleAco: boolean,
    state?: QueryItem | DraftQuery,
): string[] => {
    if (isMultipleAco) return state?.access_control_objects ?? [defaultACO];

    return state?.access_control_object ? [state?.access_control_object] : [defaultACO];
};

export const getCurrentQueryACO = (state: RootState) => {
    const defaultACO = getDefaultQueryACO(state);

    return getAco(defaultACO, selectIsMultipleAco(state), state.queryTracker.query?.queryItem);
};

export const getCurrentDraftQueryACO = (state: RootState) => {
    const defaultACO = getDefaultQueryACO(state);

    return getAco(defaultACO, selectIsMultipleAco(state), state.queryTracker.query?.draft);
};

export const getProgressYQLStatistics = (state: RootState) => {
    return state.queryTracker?.query?.queryItem?.progress?.yql_statistics;
};
