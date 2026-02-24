const STRUCT_TYPE = 'StructType';
const LIST_TYPE = 'ListType';
const STREAM_TYPE = 'StreamType';
const TUPLE_TYPE = 'TupleType';
const DICT_TYPE = 'DictType';
export const DATA_TYPE = 'DataType';
const VARIANT_TYPE = 'VariantType';
export const OPTIONAL_TYPE = 'OptionalType';
const TAGGED_TYPE = 'TaggedType';
export const VOID_TYPE = 'VoidType';
const NULL_TYPE = 'NullType';
const EMPTY_DICT_TYPE = 'EmptyDictType';
const EMPTY_LIST_TYPE = 'EmptyListType';
export const HISTOGRAM_TYPE = 'HistogramType';
export const HISTOGRAM_LIST_TYPE = 'HistogramListType';
export const HISTOGRAM_TUPLE_TYPE = 'HistogramTupleType';
export const PG_TYPE = 'PgType';

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
    | typeof HISTOGRAM_TYPE
    | typeof PG_TYPE;

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

export type DataTypeType =
    | (typeof notSimpleDataTypes)[number]
    | (typeof numericDataTypes)[number]
    | (typeof dateTimeDataTypes)[number]
    | (typeof stringDataTypes)[number]
    | 'Bool'
    | 'Raw'
    | 'Uuid'
    | 'Dynumber'
    | string;

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

type DictType = [typeof DICT_TYPE, TypeArray, TypeArray];
type OptionalType = [typeof OPTIONAL_TYPE, TypeArray];

type ListType = [typeof LIST_TYPE, TypeArray];

export type StructType = [typeof STRUCT_TYPE, [string, TypeArray][]];

export type HistogramType = [
    typeof HISTOGRAM_TYPE,
    StructType | [typeof OPTIONAL_TYPE, StructType],
];
export type HistogramListType = [typeof HISTOGRAM_LIST_TYPE, HistogramType];
export type HistogramTupleType = [typeof HISTOGRAM_TUPLE_TYPE, HistogramType[]];

export type TypeArray =
    | [typeof DATA_TYPE, DataTypeType, ...params: Array<string>]
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
    | [typeof PG_TYPE, string];

export type DataTypeTuple = {
    name: 'Tuple';
    complex: true;
    type: DataType[];
};
export type DataTypeStruct = {
    name: 'Struct';
    complex: true;
    struct: Struct;
};
export type DataTypeVariant = {
    name: 'Variant';
    complex: true;
    struct: Struct;
};
export type DataTypeList = {
    name: 'List';
    complex: true;
    type: DataType;
};

export type StructEntry = {key: string | number; type: DataType};
type Struct = StructEntry[];

type ComplexDataType =
    | {
          name: 'Set';
          complex: true;
          type: DataType;
      }
    | {
          name: 'Dict';
          complex: true;
          type: DataType[];
      }
    | DataTypeStruct
    | DataTypeTuple
    | DataTypeList
    | {
          name: 'Enum';
          complex: true;
          type: {name: string | number}[];
      }
    | DataTypeVariant
    | {
          name: 'Stream';
          complex: true;
          type: DataType;
      };
export function isComplexDataType(dataType: DataType): dataType is ComplexDataType {
    return Boolean(dataType.complex);
}
export type DataType = {
    optional?: boolean;
    optionalLevel?: number;
    tagged?: boolean;
    tags?: string[];
    simple?: boolean;
    numeric?: boolean;
    dateTime?: boolean;
    string?: boolean;
    params?: unknown[];
    complex?: boolean;
    null?: boolean;
} & (
    | ComplexDataType
    | {
          name: 'EmptyList' | 'EmptyDict' | 'Void' | 'Null' | 'Unknown';
      }
    | {
          name: DataTypeType;
          params?: unknown[];
      }
);
export function getType(typeArray: TypeArray): DataType {
    function setOptional(dataType: DataType) {
        if (dataType.optional) {
            dataType.optionalLevel = (dataType.optionalLevel || 1) + 1;
        }
        dataType.optional = true;
        return dataType;
    }

    function setTag(dataType: DataType, typeTag: string) {
        dataType.tagged = true;
        dataType.tags = (dataType.tags || []).concat(typeTag);
        return dataType;
    }

    function isEnum(variantTypes: {type: {name: string | number}}[]) {
        return variantTypes.every((variantType) => variantType.type.name === 'Void');
    }

    function isSet(dictType: DictType) {
        return dictType[2][0] === VOID_TYPE;
    }

    function getEnumValue(variantType: {key: string | number}) {
        return {
            name: variantType.key,
        };
    }

    function getVariantType(typeArray: TypeArray) {
        const variantType = getType(typeArray);
        switch (variantType.name) {
            case 'Tuple':
                return (variantType as DataTypeTuple).type.map((type, index) => ({
                    key: index,
                    type: type,
                }));
            case 'Struct':
                return (variantType as DataTypeStruct).struct;
            default:
                throw new Error(`Invalid type in Variant type: ${variantType.name}`);
        }
    }

    switch (typeArray[0]) {
        case DATA_TYPE:
            return {
                name: typeArray[1],
                simple: isDataTypeSimple(typeArray[1]),
                numeric: isDataTypeNumeric(typeArray[1]),
                dateTime: isDataTypeDateTime(typeArray[1]),
                string: isDataTypeString(typeArray[1]),
                params: typeArray.slice(2),
            };
        case OPTIONAL_TYPE:
            return setOptional(getType(typeArray[1]));
        case TAGGED_TYPE:
            return setTag(getType(typeArray[2]), typeArray[1]);
        case DICT_TYPE:
            if (isSet(typeArray)) {
                return {
                    name: 'Set',
                    complex: true,
                    type: getType(typeArray[1]),
                };
            }
            return {
                name: 'Dict',
                complex: true,
                // @ts-ignore
                type: typeArray.slice(1).map(getType),
            };
        case LIST_TYPE:
            return {
                name: 'List',
                complex: true,
                type: getType(typeArray[1]),
            };
        case EMPTY_DICT_TYPE:
            return {
                name: 'EmptyDict',
            };
        case EMPTY_LIST_TYPE:
            return {
                name: 'EmptyList',
            };
        case STREAM_TYPE:
            return {
                name: 'Stream',
                complex: true,
                type: getType(typeArray[1]),
            };
        case TUPLE_TYPE:
            return {
                name: 'Tuple',
                complex: true,
                type: typeArray[1].map(getType),
            };
        case STRUCT_TYPE:
            return {
                name: 'Struct',
                complex: true,
                struct: typeArray[1].map((field) => ({key: field[0], type: getType(field[1])})),
            };
        case VARIANT_TYPE: {
            const variantType = getVariantType(typeArray[1]);
            if (isEnum(variantType)) {
                return {
                    name: 'Enum',
                    complex: true,
                    type: variantType.map(getEnumValue),
                };
            }

            return {
                name: 'Variant',
                complex: true,
                struct: variantType,
            };
        }
        case VOID_TYPE:
            return {
                name: 'Void',
            };
        case NULL_TYPE:
            return {
                name: 'Null',
                null: true,
            };
        case PG_TYPE: {
            const typeName = typeArray[1];
            if (typeName.startsWith('_pg') || typeName.startsWith('pg')) {
                return {name: typeName};
            }
            return {name: typeName.startsWith('_') ? `_pg${typeName.slice(1)}` : `pg${typeName}`};
        }
        default:
            return {
                name: 'Unknown',
            };
    }
}
