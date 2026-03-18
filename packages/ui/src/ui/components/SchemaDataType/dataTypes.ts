import fromPairs_ from 'lodash/fromPairs';
import isEqual_ from 'lodash/isEqual';
import zip_ from 'lodash/zip';

import {
    DATA_TYPE,
    DICT_TYPE,
    type DataType,
    type DataTypeList,
    type DataTypeStruct,
    type DataTypeTuple,
    type DataTypeVariant,
    EMPTY_DICT_TYPE,
    EMPTY_LIST_TYPE,
    HISTOGRAM_TYPE,
    LIST_TYPE,
    NULL_TYPE,
    OPTIONAL_TYPE,
    PG_TYPE,
    STREAM_TYPE,
    STRUCT_TYPE,
    type StructType,
    TAGGED_TYPE,
    TUPLE_TYPE,
    type TypeArray,
    VARIANT_TYPE,
    VOID_TYPE,
} from '@ytsaurus/components';

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

type HistogramContentType = StructType | ['OptionalType', StructType];

export function isHistogramListType(
    field: TypeArray,
): field is [typeof LIST_TYPE, StructType | ['OptionalType', StructType]] {
    if (isListType(field)) {
        return isHistogramType(field[1]);
    }
    return false;
}

export function isHistogramType(rawField: TypeArray): rawField is HistogramContentType {
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

type OptionalType = [typeof OPTIONAL_TYPE, TypeArray];
export function isOptionalType(typeArray: unknown): typeArray is OptionalType {
    return (
        Array.isArray(typeArray) && typeArray[0] === OPTIONAL_TYPE && Array.isArray(typeArray[1])
    );
}
type ListType = [typeof LIST_TYPE, TypeArray];
export function isListType(typeArray: unknown): typeArray is ListType {
    return Array.isArray(typeArray) && typeArray[0] === LIST_TYPE && Array.isArray(typeArray[1]);
}
export function isStructType(typeArray: unknown): typeArray is StructType {
    return Array.isArray(typeArray) && typeArray[0] === STRUCT_TYPE && Array.isArray(typeArray[1]);
}

export function isTupleDataType(dataType: DataType): dataType is DataTypeTuple {
    return dataType.name === 'Tuple';
}

export function isListDataType(dataType: DataType): dataType is DataTypeList {
    return dataType.name === 'List';
}

export function isEmptyListDataType(dataType: DataType): dataType is DataTypeStruct {
    return dataType.name === 'EmptyList';
}

export function isStructDataType(dataType: DataType): dataType is DataTypeStruct {
    return dataType.name === 'Struct';
}

export function isVariantDataType(dataType: DataType): dataType is DataTypeVariant {
    return dataType.name === 'Variant';
}

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
