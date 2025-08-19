import {QueryEngine} from '../../../../../shared/constants/engines';
import type {QueriesHistoryCursorDirection} from '../query-tracker-contants';
import {QueryStatus} from '../../../../types/query-tracker';

export enum QueriesListAuthorFilter {
    All = 'all',
    My = 'my',
}

export enum QueriesListMode {
    History = 'history',
    Tutorials = 'tutorials',
    VCS = 'vcs',
    Navigation = 'navigation',
}

export const QueriesListFilterPresets: Record<QueriesListMode, Partial<QueriesListFilter>> = {
    [QueriesListMode.History]: {
        is_tutorial: false,
    },
    [QueriesListMode.VCS]: {
        is_tutorial: false,
    },
    [QueriesListMode.Tutorials]: {
        is_tutorial: true,
    },
    [QueriesListMode.Navigation]: {
        is_tutorial: false,
    },
};

export const DefaultQueriesListFilter: Record<QueriesListMode, Partial<QueriesListFilter>> = {
    [QueriesListMode.History]: {
        user: QueriesListAuthorFilter.My,
    },
    [QueriesListMode.Tutorials]: {},
    [QueriesListMode.VCS]: {},
    [QueriesListMode.Navigation]: {},
};

export type QueriesListFilter = {
    user?: string;
    engine?: QueryEngine;
    from?: number;
    to?: number;
    state?: QueryStatus;
    filter?: string;
    is_tutorial?: boolean;
};

export type QueriesListCursor = {
    cursorTime?: string;
    direction: QueriesHistoryCursorDirection;
};
