import * as React from 'react';

import {List} from '../List';
import {handleRefs} from '../../utils';

import {ColumnType, DataTableProps, SortOrder, SortState} from './types';
import {externalToInternalSortOrder, getSortOrder, internalToExternalSortOrder} from './utils';

import cn from 'bem-cn-lite';

import './Table.scss';

const block = cn('table');

const ICON_ASC = (
    <svg className={block('icon')} viewBox="0 0 10 6" width="10" height="6">
        <path fill="currentColor" d="M0 5h10l-5 -5z" />
    </svg>
);

const ICON_DESC = (
    <svg className={block('icon')} viewBox="0 0 10 6" width="10" height="6">
        <path fill="currentColor" d="M0 1h10l-5 5z" />
    </svg>
);

function getSortIcon(order?: SortOrder) {
    switch (order) {
        case 'ascending':
            return ICON_ASC;
        case 'descending':
            return ICON_DESC;
        default:
            return null;
    }
}

function ColumnSortIcon({
    sortOrder,
    sortIndex,
    sortable,
    defaultOrder,
}: {
    sortOrder?: SortOrder;
    sortIndex?: number;
    sortable?: boolean;
    defaultOrder?: SortOrder;
}) {
    if (sortable) {
        return (
            <span className={block('sort-icon', {shadow: !sortOrder})} data-index={sortIndex}>
                {getSortIcon(sortOrder || defaultOrder)}
            </span>
        );
    } else {
        return null;
    }
}

const DEFAULT_MIN_WIDTH = 50;

type TableHeadProps<T> = {
    columns: ColumnType<T>[];
    sortable: boolean;
    defaultOrder?: SortOrder;
    onSort?: (column: ColumnType<T>, multisort: boolean) => void;
    sortOrder: Record<string, SortOrder>;
    sortColumns: string[];
};
function TableHead<T>({
    columns,
    sortOrder,
    sortColumns,
    sortable,
    defaultOrder,
    onSort,
}: TableHeadProps<T>) {
    function getOnSortClick(column: ColumnType<T>) {
        return sortable && column.sortable
            ? (event: React.MouseEvent) => {
                  onSort?.(column, event.ctrlKey || event.metaKey);
              }
            : undefined;
    }
    return (
        <React.Fragment>
            {columns.map((column, index) => {
                const {
                    className,
                    name,
                    header,
                    title,
                    align,
                    customStyle,
                    width,
                    minWidth = DEFAULT_MIN_WIDTH,
                    maxWidth,
                } = column;
                const flex = typeof width === 'number' ? `0 0 ${width}px` : `1 0 ${minWidth}px`;
                return (
                    <div
                        className={block(
                            'th',
                            {sortable: sortable && column.sortable, align},
                            className,
                        )}
                        key={name}
                        title={typeof title === 'string' ? title : undefined}
                        data-index={index}
                        style={{flex, maxWidth, ...customStyle?.({header: true, name})}}
                        onClick={getOnSortClick(column)}
                    >
                        <div className={block('head-cell')}>
                            {header ?? name}
                            {
                                <ColumnSortIcon
                                    sortable={sortable && column.sortable}
                                    defaultOrder={column.defaultOrder || defaultOrder}
                                    sortOrder={sortOrder[name]}
                                    sortIndex={sortColumns.indexOf(name)}
                                />
                            }
                        </div>
                    </div>
                );
            })}
        </React.Fragment>
    );
}

function renderRowColumns<T>({
    columns,
    row,
    index,
    active,
    selected,
}: {
    columns: ColumnType<T>[];
    row: T;
    index: number;
    active?: boolean;
    selected?: boolean;
}) {
    return columns.map((column, columnIndex) => {
        const {
            name,
            className,
            align,
            sortable,
            title,
            accessor,
            width,
            minWidth = DEFAULT_MIN_WIDTH,
            maxWidth,
            customStyle,
            render,
            onClick,
        } = column;
        const value = typeof accessor === 'function' ? accessor(row) : row[column.name as keyof T];
        const flex = typeof width === 'number' ? `0 0 ${width}px` : `1 0 ${minWidth}px`;
        return (
            <div
                key={columnIndex}
                className={block('td', {align, sortable}, className)}
                title={typeof title === 'function' ? title(row) : title}
                style={{
                    flex,
                    maxWidth,
                    ...customStyle?.({
                        row,
                        index,
                        name,
                        header: false,
                    }),
                }}
                onClick={() => {
                    onClick?.(row, column);
                }}
            >
                <div className={block('row-cell')}>
                    {typeof render === 'function'
                        ? render({value, row, index, active, selected})
                        : value}
                </div>
            </div>
        );
    });
}

type TableRowProps<T> = {
    row: T;
    index: number;
    columns: ColumnType<T>[];
    render?: DataTableProps<T>['renderRow'];
    active?: boolean;
    selected?: boolean;
};
const TableRow = React.memo(function TableRow({
    row,
    index,
    columns,
    render,
    active,
    selected,
}: TableRowProps<any>) {
    return (
        <React.Fragment>
            {typeof render === 'function'
                ? render({
                      row,
                      index,
                      columns,
                      render: () => renderRowColumns({columns, row, index, active, selected}),
                      active,
                      selected,
                  })
                : renderRowColumns({columns, row, index, active, selected})}
        </React.Fragment>
    );
});

export default function Table<T>({
    containerRef,
    className,
    view = 'default',
    columns,
    data,
    rowWrapper,
    rowHeight,
    renderRow,
    rowClassName,
    rowKey,
    alwaysShowActiveRow,
    activeRowIndex,
    selectedRowKey,
    headerClassName,
    headerHeight,
    onSort,
    initialSortOrder,
    onRowClick,
    settings: {sortable = true, defaultOrder = 'ascending', disableSortReset = false} = {},
    canFetchMore,
    isFetchingMore,
    fetchMore,
    onWrapperScroll,
    scrollRef,
}: DataTableProps<T>) {
    const [sortState, setSortState] = React.useState<SortState>(() =>
        externalToInternalSortOrder(initialSortOrder),
    );
    const _containerRef = React.useRef<HTMLDivElement>(null);

    const handleSort = React.useCallback(
        (column: ColumnType<T>, multisort: boolean) => {
            const newState = getSortOrder(
                sortState,
                column.name,
                column.defaultOrder || defaultOrder,
                multisort,
                disableSortReset,
            );
            setSortState(newState);
            if (onSort) {
                onSort(internalToExternalSortOrder(newState));
            }
        },
        [defaultOrder, disableSortReset, onSort, sortState],
    );
    const renderHeader = React.useCallback(
        () => (
            <TableHead
                {...sortState}
                sortable={sortable}
                defaultOrder={defaultOrder}
                columns={columns}
                onSort={handleSort}
            />
        ),
        [columns, defaultOrder, handleSort, sortState, sortable],
    );

    const renderRowIml = React.useCallback(
        (row: T, index: number, {active, selected}: {active?: boolean; selected?: boolean}) => (
            <TableRow {...{row, index, columns, active, selected}} render={renderRow} />
        ),
        [columns, renderRow],
    );

    React.useEffect(() => {
        const minWidth =
            columns.reduce(
                (minTableWidth, {width, minWidth = DEFAULT_MIN_WIDTH}) =>
                    minTableWidth + (width ?? minWidth),
                0,
            ) + 30;
        _containerRef.current?.style.setProperty('--table-min-width', `${minWidth}px`);
    }, [columns]);

    // const {getListProps} = useActiveItem({items: data, onItemClick: onRowClick, itemWrapper: rowWrapper});
    const itemClassName = React.useCallback(
        (item: T, index: number) => {
            return block(
                'row',
                typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName,
            );
        },
        [rowClassName],
    );
    return (
        <List
            {...({
                containerRef: handleRefs(_containerRef, containerRef),
                className: block({view}, className),
                wrapperClassName: block('table'),
                headerClassName: block('head', headerClassName),
                headerHeight,
                renderHeader,
                itemWrapper: rowWrapper,
                items: data,
                onItemClick: onRowClick,
                itemClassName: itemClassName,
                itemHeight: rowHeight,
                loaderHeight: rowHeight,
                renderItem: renderRowIml,
                itemKey: rowKey,
                alwaysShowActiveItem: alwaysShowActiveRow,
                activeItemIndex: activeRowIndex,
                selectedItemKey: selectedRowKey,
                canFetchMore,
                isFetchingMore,
                fetchMore,
                onWrapperScroll,
                scrollRef,
            } as const)}
        />
    );
}
