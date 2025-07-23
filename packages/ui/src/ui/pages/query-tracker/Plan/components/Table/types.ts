import type * as React from 'react';

import type {ListProps} from '../../../../../components/List';

export type SortOrder = 'ascending' | 'descending';
export type Align = 'left' | 'center' | 'right';

export interface ColumnType<T> {
    name: string;
    key?: string;
    header?: React.ReactNode;
    title?: string | ((row: T) => string);
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    align?: Align;
    sortable?: boolean;
    sortAscending?: (row1: T, row2: T) => number;
    sortAccessor?: (row: T) => any;
    defaultOrder?: SortOrder;
    render?: (args: {
        value: any;
        row: T;
        index: number;
        active?: boolean;
        selected?: boolean;
    }) => React.ReactNode;
    accessor?: string | ((row: T) => any);
    customStyle?: (
        args:
            | {
                  header: true;
                  name: string;
              }
            | {
                  header: false;
                  name: string;
                  row: T;
                  index: number;
              },
    ) => React.CSSProperties;
    onClick?: (row: T, column: ColumnType<T>) => void;
    className?: string;
}

export interface SortOrderShape {
    name: string;
    order: SortOrder;
}

export interface DataTableProps<T> {
    containerRef?: React.Ref<HTMLDivElement>;
    className?: string;
    view?: string;
    columns: ColumnType<T>[];
    data: T[];
    emptyDataMessage?: string;
    rowWrapper?: ListProps<T>['itemWrapper'];
    rowHeight?: number;
    renderRow?: (args: {
        row: T;
        index: number;
        columns: ColumnType<T>[];
        render: () => React.ReactNode;
        active?: boolean;
        selected?: boolean;
    }) => React.ReactNode;
    renderEmptyRow?: () => React.ReactNode;
    rowClassName?: string | ((row: T, index: number) => string);
    rowKey?: (row: T, index: number) => string | number;
    alwaysShowActiveRow?: boolean;
    activeRowIndex?: number;
    selectedRowKey?: React.Key;
    headerClassName?: string;
    headerHeight?: number;
    initialSortOrder?: SortOrderShape | SortOrderShape[];
    settings?: {
        displayIndices?: boolean;
        sortable?: boolean;
        highlightRows?: boolean;
        stripedRows?: boolean;
        defaultOrder?: SortOrder;
        disableSortReset?: boolean;
    };
    onSort?: (sortedColumns: SortOrderShape[]) => void;
    onRowClick?: (
        row: T,
        index: number,
        event?: React.MouseEvent | MouseEvent,
        fromKeyboard?: boolean,
    ) => void;

    canFetchMore?: boolean;
    isFetchingMore?: boolean;
    fetchMore?: ListProps<T>['fetchMore'];
    onWrapperScroll?: ListProps<T>['onWrapperScroll'];
    scrollRef?: ListProps<T>['scrollRef'];
}

export type SortState = {
    sortOrder: Record<string, SortOrder>;
    sortColumns: string[];
};
