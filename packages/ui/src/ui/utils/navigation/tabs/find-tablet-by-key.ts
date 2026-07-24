import ypath from '../../../common/thor/ypath';

type PivotItem = {$type: string; $value: string | number | boolean | null};
type TabletWithPivotKey = {pivot_key?: PivotItem[]};
type TypeV3 = string | {type_name?: string; item?: TypeV3};
type SchemaColumn = {
    type?: string;
    type_v3?: TypeV3;
    sort_order?: string;
};

type ComparableValue = bigint | number | string | boolean;

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

function parseValue(value: PivotItem['$value'], type: string): ComparableValue {
    const stringValue = String(value);

    switch (type) {
        case 'int64':
            if (!/^[+-]?\d+$/.test(stringValue)) {
                throw new Error('Invalid int64 key component');
            }
            return BigInt(stringValue);
        case 'uint64': {
            if (!/^\+?\d+u?$/.test(stringValue)) {
                throw new Error('Invalid uint64 key component');
            }
            return BigInt(stringValue.replace(/u$/, ''));
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
            if (value === true || value === 'true' || value === '%true') {
                return true;
            }
            if (value === false || value === 'false' || value === '%false') {
                return false;
            }
            throw new Error('Invalid boolean key component');
        default:
            return String(value ?? '');
    }
}

function parseKey(filter: string, keyColumns: SchemaColumn[]) {
    const value = filter.slice(1, filter.endsWith(']') ? -1 : undefined).trim(); //  [xxx] -> xxx
    if (!value) {
        return [];
    }

    const rawFilterKeys = value.split(',').map((item) => item.trim());

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

function compareValues(left: ComparableValue, right: ComparableValue) {
    if (left < right) {
        return -1;
    }
    if (left > right) {
        return 1;
    }
    return 0;
}

function compareKeys(
    left: ComparableValue[],
    right: ComparableValue[],
    keyColumns: SchemaColumn[],
) {
    const commonLength = Math.min(left.length, right.length);

    for (let index = 0; index < commonLength; index += 1) {
        const result = compareValues(left[index], right[index]);
        if (result !== 0) {
            return keyColumns[index]?.sort_order === 'descending' ? -result : result;
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
    let key: ComparableValue[];

    try {
        key = parseKey(filter, keyColumns);
    } catch {
        return [];
    }

    let tabletIndex = 0;

    for (let index = 1; index < tablets.length; index += 1) {
        const pivotKey: PivotItem[] = ypath.getValue(tablets[index], '/pivot_key') || [];
        const comparablePivotKey = pivotKey.map((item, itemIndex) =>
            parseValue(item.$value, getColumnType(keyColumns[itemIndex] || {})),
        );

        if (compareKeys(comparablePivotKey, key, keyColumns) > 0) {
            break;
        }

        tabletIndex = index;
    }

    return [tablets[tabletIndex]];
};
