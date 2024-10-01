import {QueriesHistoryCursorDirection} from '../api';
import {QueryEngine} from '../engines';

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

export const getQueriesListModes = ({vcs}: {vcs: boolean}): QueriesListMode[] => {
    const queriesListMode = Object.values(QueriesListMode);
    return vcs ? queriesListMode : queriesListMode.filter((item) => item !== QueriesListMode.VCS);
};

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
    user?: QueriesListAuthorFilter;
    engine?: QueryEngine;
    filter?: string;
    is_tutorial?: boolean;
};

export type QueriesListCursor = {
    cursorTime: string;
    direction: QueriesHistoryCursorDirection;
};
