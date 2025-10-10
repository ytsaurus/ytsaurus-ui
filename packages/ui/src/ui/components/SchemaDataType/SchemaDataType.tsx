import React from 'react';

import {getPrimitiveTypesMap} from '../../store/selectors/global/supported-features';
import {useSelector} from '../../store/redux-hooks';
import {getType} from './dataTypes';
import DataType from './DataType/DataType';
import {parseV3Type} from './dateTypesV3';

interface Props {
    type_v3: any;
}

function SchemaDataType({type_v3}: Props) {
    const primitiveTypes = useSelector(getPrimitiveTypesMap);

    const dataTypeProps = React.useMemo(() => {
        try {
            return getType(parseV3Type(type_v3, primitiveTypes));
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
