import {type SortOrder} from '@gravity-ui/react-data-table';

import {type QueryResultMeta} from './api';
import {type DataType, type TypeArray} from '@ytsaurus/components';

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
    $incomplete?: boolean;
    $tagValue?: string;
};

export type SourceQueryResultReadyState = {
    state: QueryResultState.Ready | QueryResultState.Loading;
    resultReady: true;
    results: SourceRow[];
    columns: QueryResultColumn[];
    page: number;
    rowOffset: number;
    settings: {
        transposed?: boolean;
        viewMode?: QueryResultsViewMode;
        visibleColumns?: string[];
        pageSize: number;
        cellSize: number;
        sortOrder?: SortOrder | SortOrder[];
    };
    meta: QueryResultMeta;
};

export type SourceCell = {
    value: unknown;
    type: TypeArray;
    previewLoaded?: boolean;
};

export type SourceRow = {
    sourceIndex: number;
    cells: Record<string, SourceCell>;
};

export type QueryResultReadyState = Omit<SourceQueryResultReadyState, 'results'> & {
    results: Record<string, Result>[];
};

export type QueryResultErrorState = {
    state: QueryResultState.Error;
    resultReady?: false;
    error: Error;
    page?: undefined;
};
export type QueryResult = (
    QueryResultLoadingState | SourceQueryResultReadyState | QueryResultErrorState
) & {
    requestId?: number;
    requestOffset?: number;
    settings?: QueryResultReadyState['settings'];
};
