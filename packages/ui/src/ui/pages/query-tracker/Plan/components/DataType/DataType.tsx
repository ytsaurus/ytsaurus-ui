import * as React from 'react';

import {
    DataType as DataTypeType,
    StructEntry,
    isComplexDataType,
    isStructDataType,
    isVariantDataType,
} from '../../models/dataTypes';
import cn from 'bem-cn-lite';

import './DataType.scss';

const block = cn('data-type');

const DataTypeStructKey = ({entry, level}: {entry: StructEntry; level: number}) => (
    <React.Fragment>
        <span key="key" className={block('struct-key')}>
            {entry.key}
        </span>
        {'\u00a0:\u00a0'}
        <DataType key="type" level={level} {...entry.type} />
    </React.Fragment>
);

type Props = DataTypeType & {level?: number; defaultExpanded?: boolean};

export default function DataType({level = 0, defaultExpanded, ...dataType}: Props) {
    const [expanded, setExpanded] = React.useState(
        defaultExpanded === undefined ? level < 2 : defaultExpanded,
    );
    const {optional, optionalLevel, name, tagged, tags, params, complex} = dataType;
    return (
        <React.Fragment>
            <span
                key="name"
                className={block({
                    optional,
                    complex,
                    'optional-multilevel': (optionalLevel ?? 0) > 0,
                })}
                data-optional={optionalLevel ? `optional × ${optionalLevel}` : undefined}
                onClick={() => setExpanded((v) => !v)}
            >
                {name}
                {Array.isArray(params) && params.length > 0 && `(${params.join(', ')})`}
                {tagged && tags
                    ? tags.map((tag) => (
                          <span key={tag} className={block('tag')}>
                              {tag}
                          </span>
                      ))
                    : null}
            </span>
            {isComplexDataType(dataType) ? (
                <div key="subtype" className={block('subtype', {expanded})}>
                    <span className={block('ellipsis')} onClick={() => setExpanded((v) => !v)} />
                    {expanded && (
                        <div className={block('content', {expanded})}>
                            {isStructDataType(dataType) || isVariantDataType(dataType)
                                ? dataType.struct.map((item, index) => (
                                      <DataTypeStructKey
                                          key={index}
                                          level={level + 1}
                                          entry={item}
                                      />
                                  ))
                                : (Array.isArray(dataType.type)
                                      ? dataType.type
                                      : [dataType.type]
                                  ).map((type, index) => (
                                      <DataType
                                          key={index}
                                          level={level + 1}
                                          {...(type as DataTypeType)}
                                      />
                                  ))}
                        </div>
                    )}
                </div>
            ) : (
                <br key="separator" />
            )}
        </React.Fragment>
    );
}
