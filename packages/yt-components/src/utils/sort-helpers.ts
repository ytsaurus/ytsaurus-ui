import reduce_ from 'lodash/reduce';

type OrderK = 1 | -1;

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

/**
 * Orders elements from `items` accourding to positions of elements with the same name from schema.
 * Missing elements in schema will be added to the end.
 * @returns {*}
 */
export function sortItemsBySchema<T extends {name: string}>(
    items: Array<T>,
    schema: Array<{name: string}> = [],
) {
    const schemaIndices = reduce_(
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

export type OrderType =
    | 'asc'
    | 'desc'
    | ''
    | 'asc-undefined'
    | 'desc-undefined'
    | 'undefined-asc'
    | 'undefined-desc';
