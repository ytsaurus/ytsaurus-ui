import {yqlModel} from './shared';

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
          name: yqlModel.value.DataTypeType;
          params?: unknown[];
      }
);
export function getType(typeArray: yqlModel.value.TypeArray): DataType {
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

    function isSet(dictType: yqlModel.value.DictType) {
        return dictType[2][0] === yqlModel.value.VOID_TYPE;
    }

    function getEnumValue(variantType: {key: string | number}) {
        return {
            name: variantType.key,
        };
    }

    function getVariantType(typeArray: yqlModel.value.TypeArray) {
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
        case yqlModel.value.DATA_TYPE:
            return {
                name: typeArray[1],
                simple: yqlModel.value.isDataTypeSimple(typeArray[1]),
                numeric: yqlModel.value.isDataTypeNumeric(typeArray[1]),
                dateTime: yqlModel.value.isDataTypeDateTime(typeArray[1]),
                string: yqlModel.value.isDataTypeString(typeArray[1]),
                params: typeArray.slice(2),
            };
        case yqlModel.value.OPTIONAL_TYPE:
            return setOptional(getType(typeArray[1]));
        case yqlModel.value.TAGGED_TYPE:
            return setTag(getType(typeArray[2]), typeArray[1]);
        case yqlModel.value.DICT_TYPE:
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
        case yqlModel.value.LIST_TYPE:
            return {
                name: 'List',
                complex: true,
                type: getType(typeArray[1]),
            };
        case yqlModel.value.EMPTY_DICT_TYPE:
            return {
                name: 'EmptyDict',
            };
        case yqlModel.value.EMPTY_LIST_TYPE:
            return {
                name: 'EmptyList',
            };
        case yqlModel.value.STREAM_TYPE:
            return {
                name: 'Stream',
                complex: true,
                type: getType(typeArray[1]),
            };
        case yqlModel.value.TUPLE_TYPE:
            return {
                name: 'Tuple',
                complex: true,
                type: typeArray[1].map(getType),
            };
        case yqlModel.value.STRUCT_TYPE:
            return {
                name: 'Struct',
                complex: true,
                struct: typeArray[1].map((field) => ({key: field[0], type: getType(field[1])})),
            };
        case yqlModel.value.VARIANT_TYPE: {
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
        case yqlModel.value.VOID_TYPE:
            return {
                name: 'Void',
            };
        case yqlModel.value.NULL_TYPE:
            return {
                name: 'Null',
                null: true,
            };
        default:
            return {
                name: 'Unknown',
            };
    }
}
