import capitalize_ from 'lodash/capitalize';
import map_ from 'lodash/map';

export type Type = string | ComplexType;

interface Decimal {
    type_name: 'decimal';
    precision: number;
    scale: number;
}

interface Dict {
    type_name: 'dict';
    key: Type;
    value: Type;
}

type Variant = {type_name: 'variant'} & VariantData;
type VariantData = VariantElements | VariantMembers;
type VariantElements = {elements: Array<{type: Type}>};
type VariantMembers = {members: Array<{name: string; type: Type}>};

interface Optional {
    type_name: 'optional';
    item: Type;
}

type Tuple = {type_name: 'tuple'} & VariantElements;

interface List {
    type_name: 'list';
    item: Type;
}

type Struct = {type_name: 'struct'} & VariantMembers;

interface Tagged {
    type_name: 'tagged';
    tag: string;
    item: Type;
}

type ComplexType = Decimal | Dict | Variant | Optional | Tuple | List | Struct | Tagged;

export function parseV3Type(initialType: Type, primitiveTypes: Set<string>) {
    function ysonTypeToYql(ysonType: Type) {
        return typeof ysonType === 'string'
            ? stringToYql(ysonType, primitiveTypes)
            : objectToYql(ysonType);
    }

    function stringToYql(ysonType: string, typesMap: Set<string>) {
        if (typesMap.has(ysonType)) {
            return ['DataType', capitalize_(ysonType)] as const;
        } else {
            return ['UnknownType'] as const;
        }
    }

    function objectToYql(ysonType: ComplexType): any {
        switch (ysonType.type_name) {
            case 'decimal':
                return decimalToYql(ysonType);
            case 'dict':
                return [
                    'DictType',
                    ysonTypeToYql(ysonType.key),
                    ysonTypeToYql(ysonType.value),
                ] as const;
            case 'optional':
                return ['OptionalType' as const, ysonTypeToYql(ysonType.item)] as const;
            case 'tuple':
                return tupleToYql(ysonType);
            case 'list':
                return ['ListType', ysonTypeToYql(ysonType.item)] as const;
            case 'struct':
                return structToYql(ysonType);
            case 'variant':
                return [
                    'VariantType',
                    'elements' in ysonType ? tupleToYql(ysonType) : structToYql(ysonType),
                ] as const;
            case 'tagged':
                return ['TaggedType', ysonType.tag, ysonTypeToYql(ysonType.item)] as const;
            default:
                // let it be a fallback for now
                return ['UnknownType'] as const;
        }
    }

    function tupleToYql(ysonType: VariantElements) {
        return ['TupleType', map_(ysonType.elements, ({type}) => ysonTypeToYql(type))] as const;
    }

    function structToYql(ysonType: VariantMembers) {
        return [
            'StructType',
            map_(ysonType.members, ({name, type}) => [name, ysonTypeToYql(type)]),
        ] as const;
    }

    function decimalToYql(ysonType: {precision: number; scale: number}) {
        const {precision, scale} = ysonType;
        return ['DataType', 'Decimal', precision, scale] as const;
    }

    return ysonTypeToYql(initialType);
}
