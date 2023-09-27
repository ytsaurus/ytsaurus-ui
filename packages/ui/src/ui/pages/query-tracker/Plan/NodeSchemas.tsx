import React from 'react';
import {default as Collapse} from '../../../components/CollapsibleSection/CollapsibleSection';
import {yqlModel} from './models/shared';
import {SchemaTable} from './components/SchemaTable/SchemaTable';
import {getResultType} from './services/resultTable';
import cn from 'bem-cn-lite';

import {OperationSchemas} from './utils';

import './NodeSchemas.scss';

const block = cn('yql-node-schemas');

interface NodeSchemasProps {
    className?: string;
    schemas: OperationSchemas;
}
export function NodeSchemas({className, schemas}: NodeSchemasProps) {
    return (
        <div className={block(null, className)}>
            {schemas.inputs.length > 0 && (
                <SchemasSection title={'Inputs'} schemas={schemas.inputs} />
            )}
            {schemas.outputs.length > 0 && (
                <SchemasSection title={'Outputs'} schemas={schemas.outputs} />
            )}
        </div>
    );
}

interface SchemasSectionProps {
    title: string;
    schemas: {name: string; type: yqlModel.value.TypeArray}[];
}
function SchemasSection({title, schemas}: SchemasSectionProps) {
    return (
        <Collapse className={block('item')} size="m" name={title} collapsed={false}>
            <div>
                {schemas.map(({name, type}) => {
                    const result = getResultType(type);
                    const schemaFields =
                        result.resultType === 'table' || result.resultType === 'row'
                            ? result.scheme
                            : undefined;
                    if (!schemaFields) {
                        return null;
                    }
                    return (
                        <Collapse
                            className={block('item')}
                            key={name}
                            size="s"
                            name={name}
                            collapsed={schemas.length !== 1}
                        >
                            <div key={name}>
                                <SchemaTable schemaFields={schemaFields} />
                            </div>
                        </Collapse>
                    );
                })}
            </div>
        </Collapse>
    );
}
