import React from 'react';

import {getSchemaDateType} from './dataTypes';
import {DataType} from './DataType/DataType';
import {type Type, parseV3Type} from './dateTypesV3';
import i18n from './i18n';
import {toPrimitiveTypesSet} from './primitiveTypes';

export type SchemaDataTypePrimitiveTypes = Set<string>;

export interface SchemaDataTypeProps {
    typeV3: unknown;
    primitiveTypes?: SchemaDataTypePrimitiveTypes;
}

function SchemaDataType({typeV3, primitiveTypes}: SchemaDataTypeProps) {
    const primitiveTypesSet = React.useMemo(
        () => toPrimitiveTypesSet(primitiveTypes),
        [primitiveTypes],
    );

    const dataTypeProps = React.useMemo(() => {
        try {
            return getSchemaDateType(parseV3Type(typeV3 as Type, primitiveTypesSet));
        } catch {
            return undefined;
        }
    }, [typeV3, primitiveTypesSet]);

    return dataTypeProps ? (
        <DataType {...dataTypeProps} />
    ) : (
        <>{i18n('alert_no-type-description')}</>
    );
}

export default React.memo(SchemaDataType);
