import forOwn_ from 'lodash/forOwn';
import isNumber from 'lodash/isNumber';
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
import {
    FieldTree,
    fieldTreeForEach,
    fieldTreeSome,
    filterFieldTree,
} from '../../../../common/hammer/field-tree';
import {ValueOf} from '../../../../../@types/types';

export interface StatisticItemSummary {
    min: number;
    max: number;
    sum: number;
    count: number;
}

const QT_STAGE = getQueryTrackerStage();
const getState = (state: RootState) => state.queryTracker.query;

const DEFAULT_QUERY_ACO = 'nobody';
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

export const getCurrentQueryACO = (state: RootState) =>
    state.queryTracker.query?.queryItem?.access_control_object || DEFAULT_QUERY_ACO;

export const getCurrentDraftQueryACO = (state: RootState) =>
    state.queryTracker.query?.draft?.access_control_object || DEFAULT_QUERY_ACO;

const isSummaryItem = (v: ValueOf<FieldTree<StatisticItemSummary>>): v is StatisticItemSummary => {
    if (typeof v === 'string') {
        return true;
    }

    if (isNumber(v)) {
        return true;
    }

    return ['count', 'sum', 'min', 'avg', 'max'].some((key) => key in v);
};

const getProgressYQLStatistics = (state: RootState) => {
    return state.queryTracker?.query?.queryItem?.progress?.yql_statistics;
};

export const getProgressYQLStatisticsFilterText = (state: RootState) =>
    state.queryTracker?.query?.filters?.progressYQLStatistic?.text ?? '';

const filterProgressYQLStatisticsTree = createSelector(
    [getProgressYQLStatistics, getProgressYQLStatisticsFilterText],
    (tree, filterText: string) => {
        if (!filterText) {
            return tree;
        }

        const checkByName = !filterText.length
            ? () => true
            : (path: Array<string>) => {
                  const pathText = path.join('/');
                  return pathText.indexOf(filterText) !== -1;
              };

        return filterFieldTree(
            tree ?? {},
            isSummaryItem,
            (path, tree) => {
                if (checkByName(path)) {
                    return true;
                }
                return tree && fieldTreeSome(tree, isSummaryItem, checkByName, path.slice());
            },
            (items) => items,
        );
    },
);

export const getProgressYQLStatisticsFiltered = createSelector(
    [filterProgressYQLStatisticsTree],
    (tree) => {
        const res: Array<{
            name: string;
            title: string;
            level: number;
            data?: StatisticItemSummary;
            isLeafNode?: boolean;
        }> = [];
        fieldTreeForEach<StatisticItemSummary>(tree ?? {}, isSummaryItem, (path, _tree, item) => {
            const isLeafNode = Boolean(item);

            res.push({
                title: path[path.length - 1],
                level: path.length - 1,
                data: item,
                isLeafNode,
                name: path.join('/'),
            });
        });
        return res;
    },
);
