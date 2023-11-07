import {SortOrder, SortOrderShape, SortState} from './types';

const emptySortState: SortState = {
    sortOrder: {},
    sortColumns: [],
};

export function getSortOrder(
    sortState: SortState,
    name: string,
    defaultOrder: SortOrder,
    multiColumnSort = false,
    disableSortReset = false,
) {
    if (!name) {
        return multiColumnSort ? sortState : emptySortState;
    }
    const {sortOrder, sortColumns} = sortState;

    let newColumns = sortColumns;
    const prevOrder = sortOrder[name];

    let order: SortOrder | undefined = defaultOrder;
    if (prevOrder) {
        if (prevOrder === defaultOrder || disableSortReset) {
            order = prevOrder === 'ascending' ? 'descending' : 'ascending';
        } else {
            // reset sort order if previously was set non-default
            order = undefined;
        }
    }

    if (!multiColumnSort) {
        return order
            ? {
                  sortOrder: {[name]: order},
                  sortColumns: [name],
              }
            : emptySortState;
    }

    const {[name]: _, ...newOrder} = sortOrder;

    if (order) {
        newOrder[name] = order;
        if (!new Set(sortColumns).has(name)) {
            newColumns = [...sortColumns, name];
        }
    } else {
        newColumns = sortColumns.filter((n) => n !== name);
    }

    return {
        sortOrder: newOrder,
        sortColumns: newColumns,
    };
}

export function internalToExternalSortOrder({sortOrder, sortColumns}: SortState): SortOrderShape[] {
    return sortColumns.map((name) => ({name, order: sortOrder[name]}));
}

export function externalToInternalSortOrder(
    columns?: SortOrderShape | SortOrderShape[],
): SortState {
    if (!columns) {
        return emptySortState;
    }
    const columnList = Array.isArray(columns) ? columns : [columns];
    return columnList.reduce((result, {name, order}) => {
        return getSortOrder(result, name, order, true);
    }, emptySortState);
}
