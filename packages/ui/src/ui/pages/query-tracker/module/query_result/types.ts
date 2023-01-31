import {QueryResultMeta} from '../api';
import {DataType} from '../../../../components/SchemaDataType/dataTypes';

export enum QueryResultState {
    Init = 'init',
    Loading = 'loading',
    Ready = 'ready',
    Error = 'error',
}
export type QueryResultLoadingState = {
    state: QueryResultState.Init | QueryResultState.Loading;
    resultReady: false;
};

export type QueryResultColumn = {
    name: string;
    displayName: string;
    type: DataType;
};

export enum QueryResultsViewMode {
    Table = 'table',
    Scheme = 'scheme',
}

export type QueryResultReadyState = {
    state: QueryResultState.Ready;
    resultReady: true;
    results: Record<string, {$type: string; $value: unknown}>[];
    columns: QueryResultColumn[];
    page: number;
    settings: {
        transposed?: boolean;
        viewMode?: QueryResultsViewMode;
        visibleColumns?: string[];
        pageSize: number;
        cellSize: number;
    };
    meta: QueryResultMeta;
};

export type QueryResultErrorState = {
    resultReady: false;
    state: QueryResultState.Error;
    error: Error;
};
export type QueryResult = QueryResultLoadingState | QueryResultReadyState | QueryResultErrorState;
