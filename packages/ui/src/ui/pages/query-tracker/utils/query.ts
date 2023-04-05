import {
    AbortableStatuses,
    CompletedStates,
    ProgressStatuses,
    QueryEngine,
    QueryItem,
} from '../module/api';

export function isQueryProgress(query: QueryItem): boolean {
    return ProgressStatuses.includes(query.state);
}

export function isQueryCompleted(query: QueryItem): boolean {
    return CompletedStates.includes(query.state);
}

export function isAbortable(query: QueryItem): boolean {
    return AbortableStatuses.includes(query.state);
}

export const QueryEnginesNames: Record<QueryEngine, string> = {
    [QueryEngine.YQL]: 'YQL',
    [QueryEngine.YT_QL]: 'YT QL',
    [QueryEngine.CHYT]: 'CHYT',
};
