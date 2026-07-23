import ypath from '../../../common/thor/ypath';
import {compareWithUndefined} from '../../sort-helpers';

type PivotItem = {$type: string; $value: string};
type TabletWithPivotKey = {pivot_key?: PivotItem[]};
type TypeV3 = string | {type_name?: string; item?: TypeV3};
type SchemaColumn = {
    type?: string;
    type_v3?: TypeV3;
    sort_order?: string;
};

type PivotValue = bigint | number | string | boolean;

export const isPivotFilter = (filter: string) => {
    return /^\[/.test(filter); // [xxx], [xxx, [xxx, yyy], [xxx, yyy
};

function getTypeV3Name(type?: TypeV3): string | undefined {
    if (typeof type === 'string') {
        return type;
    }
    if (type?.type_name === 'optional') {
        return getTypeV3Name(type.item);
    }
    return type?.type_name;
}

function getColumnType(column: SchemaColumn) {
    return getTypeV3Name(column.type_v3) || column.type || 'string';
}

function parseValue(value: string, type: string): PivotValue {
    const stringValue = value.trim();

    switch (type) {
        case 'int64':
            return BigInt(stringValue);
        case 'uint64': {
            // The `u` suffix is a valid uint64 literal notation, strip it before parsing.
            const normalized = stringValue.endsWith('u') ? stringValue.slice(0, -1) : stringValue;
            return BigInt(normalized);
        }
        case 'double':
        case 'float': {
            const numberValue = Number(value);
            if (!Number.isFinite(numberValue)) {
                throw new Error(`Invalid ${type} key component`);
            }
            return numberValue;
        }
        case 'boolean':
            if (value === 'true' || value === '%true') {
                return true;
            }
            if (value === 'false' || value === '%false') {
                return false;
            }
            throw new Error('Invalid boolean key component');
        default:
            return value;
    }
}

function parseKey(filter: string, keyColumns: SchemaColumn[]) {
    const value = filter.slice(1, filter.endsWith(']') ? -1 : undefined).trim(); //  [xxx] -> xxx
    if (!value) {
        return [];
    }

    // Key components may be separated either by `,` or by `;`.
    const rawFilterKeys = value.split(/[,;]/).map((item) => item.trim());

    if (rawFilterKeys.some((item) => item === '')) {
        throw new Error('Empty key component');
    }
    if (keyColumns.length && rawFilterKeys.length > keyColumns.length) {
        throw new Error('Too many key components');
    }

    return rawFilterKeys.map((item, index) =>
        parseValue(item, getColumnType(keyColumns[index] || {})),
    );
}

function compareKeys(left: PivotValue[], right: PivotValue[], keyColumns: SchemaColumn[]) {
    const commonLength = Math.min(left.length, right.length);

    for (let index = 0; index < commonLength; index += 1) {
        const orderK = keyColumns[index]?.sort_order === 'descending' ? -1 : 1;
        const result = compareWithUndefined(left[index], right[index], orderK);
        if (result !== 0) {
            return result;
        }
    }

    return Math.sign(left.length - right.length);
}

export const findTabletByKey = <T extends TabletWithPivotKey>(
    filter: string,
    tablets: T[],
    schema: SchemaColumn[],
) => {
    if (!tablets.length) {
        return [];
    }

    // The Pivot key applies only to columns with `sort_order`.
    const keyColumns = schema.filter((column) => Boolean(column.sort_order));

    const getComparablePivotKey = (tablet: T) => {
        const pivotKey: PivotItem[] = ypath.getValue(tablet, '/pivot_key') || [];
        return pivotKey.map((item, itemIndex) =>
            parseValue(ypath.getValue(item), getColumnType(keyColumns[itemIndex] || {})),
        );
    };

    try {
        const key = parseKey(filter, keyColumns);

        // Tablets are sorted by their `pivot_key` in ascending index order
        let low = 0;
        let high = tablets.length - 1;
        let tabletIndex = 0;

        while (low <= high) {
            const middle = Math.floor((low + high) / 2);

            if (compareKeys(getComparablePivotKey(tablets[middle]), key, keyColumns) > 0) {
                high = middle - 1;
            } else {
                tabletIndex = middle;
                low = middle + 1;
            }
        }

        return [tablets[tabletIndex]];
    } catch {
        return [];
    }
};
