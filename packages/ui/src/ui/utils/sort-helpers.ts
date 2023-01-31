import _ from 'lodash';
import {OldSortState, SortState} from '../types';

const ascOrder = 1;
const descOrder = -1;

type OrderK = typeof ascOrder | typeof descOrder;

export function compareWithUndefined<T>(
    l: T,
    r: T,
    orderK: OrderK = 1,
    undefinedOrderK: OrderK = 1,
) {
    return l === r
        ? 0
        : l == undefined
        ? undefinedOrderK
        : r == undefined
        ? -1 * undefinedOrderK
        : orderK * (l > r ? 1 : -1);
}

type ColumnSortInfo<T> = {
    key: keyof T;
    orderK?: OrderK;
    undefinedOrderK?: OrderK;
};
export function multiSortWithUndefined<T extends {}>(
    items: Array<T>,
    keys: Array<keyof T | ColumnSortInfo<T>>,
) {
    const columnsInfo = _.reduce(
        keys,
        (acc, item) => {
            if ('string' === typeof item) {
                acc.push({key: item, orderK: 1, undefinedOrderK: 1});
            } else {
                const {key, orderK = 1, undefinedOrderK = 1} = item as unknown as ColumnSortInfo<T>;
                acc.push({key, orderK, undefinedOrderK});
            }
            return acc;
        },
        [] as Array<{key: keyof T; orderK: OrderK; undefinedOrderK: OrderK}>,
    );

    return items.slice().sort((l, r) => {
        let res = 0;
        for (const info of columnsInfo) {
            res = compareWithUndefined(l[info.key], r[info.key], info.orderK, info.undefinedOrderK);
            if (res !== 0) {
                return res;
            }
        }
        return res;
    });
}

/**
 * Orders elements from `items` accourding to positions of elements with the same name from schema.
 * Missing elements in schema will be added to the end.
 * @returns {*}
 */
export function sortItemsBySchema<T extends {name: string}>(
    items: Array<T>,
    schema: Array<{name: string}> = [],
) {
    const schemaIndices = _.reduce(
        schema,
        (acc, item, index) => {
            acc[item.name] = index;
            return acc;
        },
        {} as {[key: string]: number},
    );

    items.sort((l, r) => {
        const lIndex = schemaIndices[l.name];
        const rIndex = schemaIndices[r.name];

        if (lIndex === undefined && rIndex === undefined) {
            return compareWithUndefined(l.name, r.name);
        }

        return compareWithUndefined(lIndex, rIndex);
    });
    return items;
}

/**
 * Firstly compares arrays by size and then by elements
 * @param l
 * @param r
 */
export function compareArraysBySizeThenByItems<T>(
    l: Array<T>,
    r: Array<T>,
    orderK?: OrderK,
    undefinedOrderK?: OrderK,
) {
    const res = compareWithUndefined(l?.length, r?.length, orderK, undefinedOrderK);
    if (res) {
        return res;
    }

    let lastResult = 0;
    _.some(l, (_, index) => {
        lastResult = compareWithUndefined(
            l !== undefined ? l[index] : l,
            r !== undefined ? r[index] : r,
            orderK,
            undefinedOrderK,
        );
        return lastResult !== 0;
    });

    return lastResult;
}

export type OrderType =
    | 'asc'
    | 'desc'
    | ''
    | 'asc-undefined'
    | 'desc-undefined'
    | 'undefined-asc'
    | 'undefined-desc';

export const DESC_ASC_UNORDERED = ['desc', 'asc', ''];

const SORT_VALUES: Array<OrderType> = ['desc', '', 'asc']; // do not change the order, see nextSortOrderValue
const SORT_VALUES_NO_UNORDERED: Array<OrderType> = ['asc', 'desc'];

export function nextSortOrderValue(
    order?: OrderType,
    allowUnordered?: boolean,
    withUndefined?: boolean,
) {
    if (withUndefined) {
        return nextSortOrderValueWithUndefined(order, allowUnordered);
    } else {
        return nextSortOrderValueAscDesc(order, allowUnordered);
    }
}

function nextSortOrderValueAscDesc(order?: OrderType, allowUnordered?: boolean) {
    const allowedValues = allowUnordered ? SORT_VALUES : SORT_VALUES_NO_UNORDERED;
    return calculateNextOrderValue(order, allowedValues);
}

export function calculateNextOrderValue(
    order: OrderType | undefined,
    allowedValues: Array<OrderType>,
) {
    const index = allowedValues.indexOf(order!);
    const nextIndex = Math.abs(index) + 1;

    return allowedValues[nextIndex % allowedValues.length];
}

// The order is important
const SORT_VALUES_WITH_UNDEFINED: Array<OrderType> = [
    'undefined-desc',
    '',
    'asc-undefined',
    'desc-undefined',
    'undefined-asc',
];
const SORT_VALUES_WITH_UNDEFINED_SKIP_UNORDERED: Array<OrderType> = [
    'undefined-asc',
    'undefined-desc',
    'asc-undefined',
    'desc-undefined',
];

const MAP_ASC_DESC: Record<string, OrderType> = {
    asc: 'asc-undefined',
    desc: 'desc-undefined',
};

function nextSortOrderValueWithUndefined(orderValue?: OrderType, allowUnordered?: boolean) {
    const order = MAP_ASC_DESC[orderValue!] || orderValue;
    const allowedValues = allowUnordered
        ? SORT_VALUES_WITH_UNDEFINED
        : SORT_VALUES_WITH_UNDEFINED_SKIP_UNORDERED;
    return calculateNextOrderValue(order, allowedValues);
}

export function orderTypeToOrderK(orderValue?: OrderType): {
    orderK: OrderK;
    undefinedOrderK: OrderK;
} {
    const res: {orderK: OrderK; undefinedOrderK: OrderK} = {
        orderK: 1,
        undefinedOrderK: 1,
    };
    if (!orderValue) {
        return res;
    }
    const order = MAP_ASC_DESC[orderValue!] || orderValue;
    res.undefinedOrderK = order.startsWith('undefined-') ? descOrder : ascOrder;
    res.orderK = order.startsWith('asc') || order.endsWith('asc') ? ascOrder : descOrder;

    return res;
}

export function sortArrayBySortState<T>(items: Array<T>, sortState?: SortState<keyof T>) {
    const {column, order} = sortState || {};
    if (!column || !order) {
        return items;
    }

    const key = column as keyof T;
    const {orderK, undefinedOrderK} = orderTypeToOrderK(order);
    return (items || []).slice().sort((l, r) => {
        const res = compareWithUndefined(l[key], r[key], orderK, undefinedOrderK);
        return res;
    });
}

export function oldSortStateToOrderType<T = string>(
    sortState?: OldSortState<T>,
): OrderType | undefined {
    const {field, asc, undefinedAsc} = sortState || {};
    if (!field || asc === undefined) {
        return '';
    }

    if (undefinedAsc === undefined) {
        return asc ? 'asc' : 'desc';
    }

    return undefinedAsc
        ? asc
            ? 'asc-undefined'
            : 'desc-undefined'
        : asc
        ? 'undefined-asc'
        : 'undefined-desc';
}

export function orderTypeToOldSortState(field: string, orderType?: OrderType): OldSortState {
    if (!orderType || !field) {
        return {};
    }

    switch (orderType) {
        case 'asc':
            return {field, asc: true};
        case 'desc':
            return {field, asc: false};
        case 'asc-undefined':
            return {field, asc: true, undefinedAsc: true};
        case 'desc-undefined':
            return {field, asc: false, undefinedAsc: true};
        case 'undefined-asc':
            return {field, asc: true, undefinedAsc: false};
        case 'undefined-desc':
            return {field, asc: false, undefinedAsc: false};
    }
}

export function compareVectors(left: any, right: any, orderK: OrderK, undefinedOrderK: OrderK) {
    const vectorAisArray = Array.isArray(left);
    const vectorBisArray = Array.isArray(right);

    if (!vectorAisArray && !vectorBisArray) {
        return compareWithUndefined(left, right, orderK, undefinedOrderK);
    }

    const leftVector = vectorAisArray ? left : [left];
    const rightVector = vectorBisArray ? right : [right];

    let comparison = 0;

    for (let i = 0, len = Math.max(leftVector.length, rightVector.length); i < len; i++) {
        comparison = compareWithUndefined(leftVector[i], rightVector[i], orderK, undefinedOrderK);

        if (comparison) {
            break;
        }
    }

    return comparison;
}
