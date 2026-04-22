import forOwn_ from 'lodash/forOwn';
import {createSelector} from 'reselect';
import {type RootState} from '../../reducers';
import {QueryStatus} from '../../../types/query-tracker';
import {
    type DraftQuery,
    type QTRequestOptions,
    type QueryItem,
    isSingleProgress,
} from '../../../types/query-tracker/api';
import {
    getSettingQueryTrackerStage,
    getSettingQueryTrackerYQLAgentStage,
} from '../settings/settings-ts';
import {getQueryTrackerStage} from '../../../config';
import {type QTEditorError, isQTEditorError} from '../../../types/query-tracker/editor';
import {type YTError} from '../../../types';
import {isYTError} from '../../../../shared/utils';
import {getQueryResults} from './queryResult';
import {selectDefaultQueryACO, selectIsMultipleAco} from './queryAco';
import {QueryEngine, QueryEnginesNames} from '../../../../shared/constants/engines';
import {selectClusterSupportedEngines} from '../global';

const QT_STAGE = getQueryTrackerStage();
const selectQueryState = (state: RootState) => state.queryTracker.query;

export const DEFAULT_QUERY_ACO = 'nobody';
export const SHARED_QUERY_ACO = 'everyone-share';

export const selectQuery = (state: RootState) => selectQueryState(state).queryItem;
export const selectQueryId = (state: RootState) => selectQueryState(state).queryItem?.id;
export const selectQueryAnnotations = (state: RootState) =>
    selectQueryState(state).queryItem?.annotations;
export const selectQueryGetParams = (state: RootState) => selectQueryState(state).params;
export const selectQueryProgress = (state: RootState) => selectQuery(state)?.progress;

export const selectQueryDraft = (state: RootState) => selectQueryState(state).draft;
export const selectQueryDraftSettings = (state: RootState) =>
    selectQueryState(state).draft.settings || {};
export const selectQueryDraftCluster = (state: RootState) =>
    selectQueryDraft(state).settings?.cluster;

export const selectQueryFiles = (state: RootState) => selectQueryState(state).draft.files;
export const selectQuerySecrets = (state: RootState) => selectQueryState(state).draft.secrets;

export const selectQueryText = (state: RootState) => selectQueryState(state).draft.query;

export const selectQueryEngine = (state: RootState) => selectQueryState(state).draft.engine;

export const selectIsQueryLoading = (state: RootState) =>
    selectQueryState(state).state === 'loading';

export const selectCliqueMap = (state: RootState) => selectQueryState(state).cliqueMap;
export const selectCliqueLoading = (state: RootState) => selectQueryState(state).cliqueLoading;
export const selectClusterLoading = (state: RootState) => selectQueryState(state).clusterLoading;

export const selectQueryItem = (state: RootState) => selectQueryState(state).queryItem;

export const selectIsQueryExecuted = (state: RootState): boolean => {
    const queryItem = selectQueryItem(state);
    // TODO: Use real query's state
    return Boolean(queryItem?.id) && queryItem?.state !== QueryStatus.DRAFT;
};

export const selectCurrentQuery = (state: RootState) => selectQueryState(state).queryItem;

export const selectIsQueryButtonActive = createSelector(
    [selectQueryEngine, selectQueryDraftSettings, selectCliqueMap],
    (engine, settings, cliqueMap) => {
        const isChyt = engine === QueryEngine.CHYT;
        if (!isChyt) return true;

        const {clique, cluster} = settings;
        if (!clique || !cluster) return true;

        if (cluster in cliqueMap) {
            const currentClique = cliqueMap[cluster].chyt.find((i) => i.alias === clique);
            if (!currentClique) return false;

            return currentClique.state === 'active';
        }

        return false;
    },
);

export const selectShouldPollCliqueWhenInactive = createSelector(
    [selectQueryEngine, selectQueryDraftSettings, selectIsQueryButtonActive],
    (engine, settings, isRunButtonActive) => {
        return (
            engine === QueryEngine.CHYT &&
            Boolean(settings?.clique && settings?.cluster) &&
            !isRunButtonActive
        );
    },
);

export const selectIsQueryDraftEditted = createSelector(
    [selectQuery, selectQueryDraft],
    (query, draft) => {
        return query?.query !== draft.query;
    },
);

export const selectHasLoadedQueryItem = (state: RootState) => {
    const queryItem = selectQueryState(state).queryItem;
    return Boolean(queryItem?.id);
};

export const selectSupportedEnginesOptions = createSelector(
    [selectClusterSupportedEngines],
    (supportedEngines) => {
        const items = Object.entries(supportedEngines).filter(([_, supported]) => supported);

        return items.map(([key]) => {
            return {
                value: key,
                text: QueryEnginesNames[key as QueryEngine],
                content: QueryEnginesNames[key as QueryEngine],
            };
        });
    },
);

export const selectQueryTrackerRequestOptions = createSelector(
    [getSettingQueryTrackerStage, getSettingQueryTrackerYQLAgentStage],
    (stage, yqlAgentStage) => {
        const res: QTRequestOptions = {
            stage: stage || QT_STAGE,
            yqlAgentStage,
        };
        return res;
    },
);

export const selectQueryEditorErrors = (state: RootState): QTEditorError[] => {
    const res: QTEditorError[] = [];
    const collectQTEditorErrors = (error: YTError<{attributes?: object}>) => {
        if (isQTEditorError(error)) {
            res.push(error);
        }
        if (error.inner_errors && error.inner_errors.length !== 0) {
            error.inner_errors.forEach((inner_error) => collectQTEditorErrors(inner_error));
        }
    };

    const {error, id} = selectQueryState(state).draft;
    if (isYTError(error)) {
        collectQTEditorErrors(error);
    }
    if (id && !selectIsQueryDraftEditted(state)) {
        const results = getQueryResults(state, id);
        if (results) {
            forOwn_(results, (value) => {
                if (value.state === 'error' && isYTError(value.error)) {
                    collectQTEditorErrors(value.error);
                }
            });
        }
    }
    const currentQuery = selectCurrentQuery(state);
    if (currentQuery && currentQuery.error) {
        collectQTEditorErrors(currentQuery.error);
    }

    return res;
};

export const selectDirtySinceLastSubmit = (state: RootState) =>
    state.queryTracker.query.dirtySinceLastSubmit;

export const selectEffectiveApiStage = (state: RootState) => {
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

export const selectCurrentQueryACO = (state: RootState) => {
    const defaultACO = selectDefaultQueryACO(state);

    return getAco(defaultACO, selectIsMultipleAco(state), state.queryTracker.query?.queryItem);
};

export const selectCurrentDraftQueryACO = (state: RootState) => {
    const defaultACO = selectDefaultQueryACO(state);

    return getAco(defaultACO, selectIsMultipleAco(state), state.queryTracker.query?.draft);
};

export const selectQuerySingleProgress = createSelector([selectQueryProgress], (progress) => {
    if (!isSingleProgress(progress)) return {};
    return progress;
});

export const selectProgressYQLStatistics = (state: RootState) => {
    const progress = selectQueryProgress(state);

    if (!isSingleProgress(progress)) return undefined;

    return progress.yql_statistics;
};

export const selectCurrentSecretIds = createSelector([selectQuerySecrets], (secrets) => {
    return secrets.map((secret) => secret.id);
});
