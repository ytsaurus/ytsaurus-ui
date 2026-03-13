import React from 'react';

import {getSchemaDateType} from './dataTypes';
import {DataType} from './DataType/DataType';
import {type Type, parseV3Type} from './dateTypesV3';
import {toPrimitiveTypesSet} from './primitiveTypes';

export type SchemaDataTypePrimitiveTypes = Set<string> | string[];

export interface SchemaDataTypeProps {
    /** Schema type in v3 format (e.g. from schema type_v3) */
    typeV3: unknown;
    /**
     * Set or array of primitive type names supported by the cluster.
     * When not provided, a default set of common YDB types is used.
     * Pass from host app e.g. from supported-features.primitive_types.
     */
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
        <>There is no type description in the schema</>
    );
}

export default React.memo(SchemaDataType);
