import type {QueryGraphSchema} from '@gravity-ui/querieskit';
import type {DataType} from '../../Plan/models/dataTypes';
import {getResultType} from '../../Plan/services/resultTable';
import type {OperationSchemas} from '../../Plan/utils';

function formatSchemaType(type: DataType): string {
    let name: string = type.name;
    if ('struct' in type) {
        name += `<${type.struct.map((field) => `${field.key}: ${formatSchemaType(field.type)}`).join(', ')}>`;
    } else if ('type' in type) {
        if (type.name === 'Enum') {
            name += `<${type.type.map((item) => item.name).join(', ')}>`;
        } else {
            const items = Array.isArray(type.type) ? type.type : [type.type];
            name += `<${items.map(formatSchemaType).join(', ')}>`;
        }
    } else if (type.params?.length) {
        name += `(${type.params.join(', ')})`;
    }
    for (const tag of type.tags ?? []) {
        name = `Tagged<${name}, ${tag}>`;
    }
    return name + '?'.repeat(type.optional ? (type.optionalLevel ?? 1) : 0);
}

export function prepareProgressSchema(
    schema: OperationSchemas['inputs'][number],
): QueryGraphSchema {
    const result = getResultType(schema.type);
    return {
        name: schema.name,
        columns:
            result.resultType === 'table' || result.resultType === 'row'
                ? result.scheme.map(({name, type}) => ({name, type: formatSchemaType(type)}))
                : [],
    };
}
