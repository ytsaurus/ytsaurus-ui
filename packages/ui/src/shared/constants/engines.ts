export enum QueryEngine {
    YQL = 'yql',
    CHYT = 'chyt',
    SPYT = 'spyt',
    YT_QL = 'ql',
}

export const QueryEnginesNames: Record<QueryEngine, string> = {
    [QueryEngine.YQL]: 'YQL',
    [QueryEngine.YT_QL]: 'YT QL',
    [QueryEngine.CHYT]: 'CHYT',
    [QueryEngine.SPYT]: 'SPYT',
};
