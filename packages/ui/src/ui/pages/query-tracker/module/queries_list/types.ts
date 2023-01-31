export enum QueriesHistoryAuthor {
    All = 'all',
    My = 'my',
}

export type QueriesHistoryFilter = {
    user?: QueriesHistoryAuthor;
    engine?: string;
    filter?: string;
};
