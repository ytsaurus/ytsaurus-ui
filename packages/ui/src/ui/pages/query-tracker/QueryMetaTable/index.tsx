import React from 'react';
import block from 'bem-cn-lite';

import {type QueryItem} from '../../../types/query-tracker/api';
import {useQueryMetadata} from './useQueryMetadata';
import './index.scss';

interface MetaTableProps {
    query: QueryItem;
    className?: string;
}

const b = block('query-meta-table');

const titleClassName = b('title');
const valueClassName = b('value');

export default function QueryMetaTable({query, className}: MetaTableProps) {
    const {items, modal} = useQueryMetadata(query);

    return (
        <>
            <dl className={b(null, className)}>
                {items.map(({id, title, value}) => (
                    <React.Fragment key={id}>
                        <dt className={titleClassName}>{title}</dt>
                        <dd className={valueClassName}>{value}</dd>
                    </React.Fragment>
                ))}
            </dl>
            {modal}
        </>
    );
}
