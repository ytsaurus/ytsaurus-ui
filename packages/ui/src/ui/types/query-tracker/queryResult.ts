import {QueryResultMeta} from './api';
import {DataType} from '../../components/SchemaDataType/dataTypes';

export enum QueryResultState {
    Init = 'init',
    Loading = 'loading',
    Ready = 'ready',
    Error = 'error',
}
export type QueryResultLoadingState = {
    state: QueryResultState.Init | QueryResultState.Loading;
    resultReady?: false;
    page?: undefined;
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

export type Result = {
    $formattedValue: string;
    $fullFormattedValue: string;
    $rawValue: string;
    $type: string;
    $value: unknown;
};

export type QueryResultReadyState = {
    state: QueryResultState.Ready;
    resultReady: true;
    results: Record<string, Result>[];
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
    state: QueryResultState.Error;
    resultReady?: false;
    error: Error;
    page?: undefined;
};
export type QueryResult = QueryResultLoadingState | QueryResultReadyState | QueryResultErrorState;
