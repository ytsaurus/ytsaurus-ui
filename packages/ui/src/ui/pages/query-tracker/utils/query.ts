import {AbortableStatuses, CompletedStates, ProgressStatuses} from '../../../types/query-tracker';
import type {QueryItem} from '../../../types/query-tracker/api';

export function isQueryProgress(query: QueryItem): boolean {
    return ProgressStatuses.includes(query.state);
}

export function isQueryCompleted(query: QueryItem): boolean {
    return CompletedStates.includes(query.state);
}

export function isAbortable(query: QueryItem): boolean {
    return AbortableStatuses.includes(query.state);
}
