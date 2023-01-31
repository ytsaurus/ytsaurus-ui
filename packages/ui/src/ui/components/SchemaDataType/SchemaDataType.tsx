import React from 'react';
import _ from 'lodash';

import {getPrimitiveTypesMap} from '../../store/selectors/global/supported-features';
import {useSelector} from 'react-redux';
import {getType} from './dataTypes';
import DataType from './DataType/DataType';

interface Props {
    type_v3: any;
}

function SchemaDataType({type_v3}: Props) {
    const primitiveTypes = useSelector(getPrimitiveTypesMap);

    const dataTypeProps = React.useMemo(() => {
        try {
            return getType(parseType(type_v3, primitiveTypes));
        } catch {
            return undefined;
        }
    }, [type_v3, primitiveTypes]);

    return dataTypeProps ? (
        <DataType {...dataTypeProps} />
    ) : (
        <>There is no type description in the schema</>
    );
}

export default React.memo(SchemaDataType);

type Type = string | ComplexType;

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

function parseType(initialType: Type, primitiveTypes: Set<string>) {
    function ysonTypeToYql(ysonType: Type) {
        return typeof ysonType === 'string'
            ? stringToYql(ysonType, primitiveTypes)
            : objectToYql(ysonType);
    }

    function stringToYql(ysonType: string, typesMap: Set<string>) {
        if (typesMap.has(ysonType)) {
            return ['DataType', _.capitalize(ysonType)] as const;
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
        return ['TupleType', _.map(ysonType.elements, ({type}) => ysonTypeToYql(type))] as const;
    }

    function structToYql(ysonType: VariantMembers) {
        return [
            'StructType',
            _.map(ysonType.members, ({name, type}) => [name, ysonTypeToYql(type)]),
        ] as const;
    }

    function decimalToYql(ysonType: {precision: number; scale: number}) {
        const {precision, scale} = ysonType;
        return ['DataType', 'Decimal', precision, scale] as const;
    }

    return ysonTypeToYql(initialType);
}
