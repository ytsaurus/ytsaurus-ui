import fromPairs_ from 'lodash/fromPairs';
import isEqual_ from 'lodash/isEqual';
import zip_ from 'lodash/zip';

export const STRUCT_TYPE = 'StructType';
export const LIST_TYPE = 'ListType';
export const STREAM_TYPE = 'StreamType';
export const TUPLE_TYPE = 'TupleType';
export const DICT_TYPE = 'DictType';
export const DATA_TYPE = 'DataType';
export const VARIANT_TYPE = 'VariantType';
export const OPTIONAL_TYPE = 'OptionalType';
export const TAGGED_TYPE = 'TaggedType';
export const VOID_TYPE = 'VoidType';
export const NULL_TYPE = 'NullType';
export const EMPTY_DICT_TYPE = 'EmptyDictType';
export const EMPTY_LIST_TYPE = 'EmptyListType';
export const HISTOGRAM_TYPE = 'HistogramType';
export const HISTOGRAM_LIST_TYPE = 'HistogramListType';
export const HISTOGRAM_TUPLE_TYPE = 'HistogramTupleType';
export const HISTOGRAM_STRUCT_TYPE = 'HistogramStructType';

export const TYPE_ARRAY_TYPES = {
    // Data types
    DATA_TYPE,
    // Container types
    STRUCT_TYPE,
    LIST_TYPE,
    STREAM_TYPE,
    TUPLE_TYPE,
    DICT_TYPE,
    VARIANT_TYPE,
    OPTIONAL_TYPE,
    TAGGED_TYPE,
    // Special types
    VOID_TYPE,
    NULL_TYPE,
    EMPTY_DICT_TYPE,
    EMPTY_LIST_TYPE,
    HISTOGRAM_TYPE,
} as const;

export const PRIMITIVE_TYPES = {
    BOOL: 'Bool',
    STRING: 'String',
    UTF8: 'Utf8',
    INT8: 'Int8',
    INT16: 'Int16',
    INT32: 'Int32',
    INT64: 'Int64',
    UINT8: 'Uint8',
    UINT16: 'Uint16',
    UINT32: 'Uint32',
    UINT64: 'Uint64',
    FLOAT: 'Float',
    DOUBLE: 'Double',
    DATE: 'Date',
    DATETIME: 'Datetime',
    TIMESTAMP: 'Timestamp',
    INTERVAL: 'Interval',
    TZ_DATE: 'TzDate',
    TZ_DATETIME: 'TzDatetime',
    TZ_TIMESTAMP: 'TzTimestamp',
    YSON: 'Yson',
    JSON: 'Json',
    UUID: 'Uuid',
    JSON_DOCUMENT: 'Raw',
    DYNUMBER: 'Dynumber',
} as const;

export type TypeArrayType =
    | typeof STRUCT_TYPE
    | typeof LIST_TYPE
    | typeof STREAM_TYPE
    | typeof TUPLE_TYPE
    | typeof DICT_TYPE
    | typeof DATA_TYPE
    | typeof VARIANT_TYPE
    | typeof OPTIONAL_TYPE
    | typeof TAGGED_TYPE
    | typeof VOID_TYPE
    | typeof NULL_TYPE
    | typeof EMPTY_DICT_TYPE
    | typeof EMPTY_LIST_TYPE
    | typeof HISTOGRAM_TYPE;

const notSimpleDataTypes = ['Void', 'Yson', 'Json', 'Null'] as const;
const numericDataTypes = [
    'Double',
    'Float',
    'Int64',
    'Int32',
    'Int16',
    'Int8',
    'Uint64',
    'Uint32',
    'Uint16',
    'Uint8',
] as const;
const dateTimeDataTypes = [
    'Date',
    'TzDate',
    'Datetime',
    'TzDatetime',
    'Timestamp',
    'TzTimestamp',
    'Interval',
] as const;
const stringDataTypes = ['String', 'Utf8', 'Json'] as const;

export type DataTypeType = (typeof PRIMITIVE_TYPES)[keyof typeof PRIMITIVE_TYPES] | 'Raw';

export type OptionalType = [typeof OPTIONAL_TYPE, YqlDataType];
export type TaggedType = [typeof TAGGED_TYPE, string, YqlDataType];
export type DictType = [typeof DICT_TYPE, YqlDataType, YqlDataType];
export type ListType = [typeof LIST_TYPE, YqlDataType];
export type EmptyDictTYpe = [typeof EMPTY_DICT_TYPE];
export type EmptyListType = [typeof EMPTY_LIST_TYPE];
export type StreamType = [typeof STREAM_TYPE, YqlDataType];
export type TupleType = [typeof TUPLE_TYPE, YqlDataType[]];
export type StructType = [typeof STRUCT_TYPE, [string, YqlDataType][]];
export type VariantType = [typeof VARIANT_TYPE, StructType | TupleType];
export type VoidType = [typeof VOID_TYPE];
export type NullType = [typeof NULL_TYPE];
export type HistogramType = [
    typeof HISTOGRAM_TYPE,
    StructType | [typeof OPTIONAL_TYPE, StructType],
    string?,
];
export type HistogramListType = [typeof HISTOGRAM_LIST_TYPE, HistogramType];
export type HistogramTupleType = [typeof HISTOGRAM_TUPLE_TYPE, HistogramType[]];
export type HistogramStructType = [typeof HISTOGRAM_STRUCT_TYPE, HistogramType[]];
export type DataType = [typeof DATA_TYPE, DataTypeType, ...unknown[]];
export type YqlDataType =
    | DataType
    | OptionalType
    | TaggedType
    | DictType
    | ListType
    | EmptyDictTYpe
    | EmptyListType
    | StreamType
    | TupleType
    | StructType
    | VariantType
    | VoidType
    | NullType
    | HistogramType;

export type TypeArray =
    | [typeof DATA_TYPE, DataTypeType, ...unknown[]]
    | OptionalType
    | [typeof TAGGED_TYPE, string, TypeArray]
    | DictType
    | ListType
    | [typeof EMPTY_DICT_TYPE]
    | [typeof EMPTY_LIST_TYPE]
    | [typeof STREAM_TYPE, TypeArray]
    | [typeof TUPLE_TYPE, TypeArray[]]
    | StructType
    | [typeof VARIANT_TYPE, TypeArray]
    | [typeof VOID_TYPE]
    | [typeof NULL_TYPE]
    | HistogramType
    | HistogramListType
    | HistogramTupleType
    | HistogramStructType;

export function isDataTypeSimple(dataType: string) {
    return (notSimpleDataTypes as unknown as string[]).indexOf(dataType) < 0;
}
export function isDataTypeNumeric(dataType: string) {
    return (numericDataTypes as unknown as string[]).indexOf(dataType) >= 0;
}
export function isDataTypeDateTime(dataType: string) {
    return (dateTimeDataTypes as unknown as string[]).indexOf(dataType) >= 0;
}

export function isDataTypeString(dataType: string) {
    return (stringDataTypes as unknown as string[]).indexOf(dataType) >= 0;
}

export function isOptionalType(typeArray: unknown): typeArray is OptionalType {
    return (
        Array.isArray(typeArray) && typeArray[0] === OPTIONAL_TYPE && Array.isArray(typeArray[1])
    );
}

export function isListType(typeArray: unknown): typeArray is ListType {
    return Array.isArray(typeArray) && typeArray[0] === LIST_TYPE && Array.isArray(typeArray[1]);
}
export function isTupleType(typeArray: unknown): typeArray is TupleType {
    return Array.isArray(typeArray) && typeArray[0] === TUPLE_TYPE && Array.isArray(typeArray[1]);
}
export function isStructType(typeArray: unknown): typeArray is StructType {
    return Array.isArray(typeArray) && typeArray[0] === STRUCT_TYPE && Array.isArray(typeArray[1]);
}
export function isVariantType(typeArray: unknown): typeArray is VariantType {
    return (
        Array.isArray(typeArray) &&
        typeArray[0] === VARIANT_TYPE &&
        (isStructType(typeArray[1]) || isTupleType(typeArray[1]))
    );
}
export function isHistogramListType(
    field: unknown,
): field is [typeof LIST_TYPE, StructType | ['OptionalType', StructType]] {
    if (isListType(field)) {
        return isHistogramType(field[1]);
    }
    return false;
}
export function isHistogramStructType(field: unknown): field is StructType {
    if (isStructType(field)) {
        return field[1].length > 0 && field[1].every((el) => isHistogramType(el[1]));
    }
    return false;
}

export function isHistogramTupleType(
    field: unknown,
): field is [typeof TUPLE_TYPE, HistogramType[1][]] {
    if (isTupleType(field)) {
        return field[1].length > 0 && field[1].every((row) => isHistogramType(row));
    }
    return false;
}

export function isHistogramType(rawField: TypeArray): rawField is HistogramType[1] {
    let field = rawField;
    while (field[0] === OPTIONAL_TYPE) {
        field = field[1];
    }
    if (field[0] === STRUCT_TYPE) {
        const struct = fromPairs_(field[1]);
        return (
            ['Bins', 'Max', 'Min', 'WeightsSum'].every((key) =>
                Object.prototype.hasOwnProperty.call(struct, key),
            ) &&
            Array.isArray(struct.Bins) &&
            struct.Bins[0] === LIST_TYPE &&
            struct.Bins[1][0] === STRUCT_TYPE &&
            isEqual_(zip_(...struct.Bins[1][1])[0].sort(), ['Frequency', 'Position'])
        );
    }
    return false;
}
