import React from 'react';
import {Icon, Link} from '@gravity-ui/uikit';
import DataTable, {Column} from '@gravity-ui/react-data-table';
import DataType from '../DataType/DataType';
import {DataType as IDataType} from '../../models/dataTypes';
import cn from 'bem-cn-lite';

import sortUpIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left.svg';
import sortDownIcon from '@gravity-ui/icons/svgs/bars-descending-align-left.svg';
import insertIcon from 'assets/icons/paste.svg';

import './SchemaTable.scss';

export interface SchemaField {
    index: number;
    name: string;
    type: IDataType;
    onNameClick?: (name: string) => void;
    sort?: {
        order: number;
        ascending: boolean;
    };
}

const block = cn('yql-schema-table');
const columns: Column<SchemaField>[] = [
    {
        name: 'name',
        header: 'name.column-header',
        sortable: false,
        render({row}) {
            if (typeof row.onNameClick === 'function') {
                const handleNameClick = row.onNameClick;
                return (
                    <Link
                        className={block('item')}
                        view="primary"
                        onClick={() => {
                            handleNameClick(row.name);
                        }}
                    >
                        {row.sort && (
                            <Icon
                                className={block('sort-icon')}
                                data={row.sort.ascending ? sortUpIcon : sortDownIcon}
                                size={16}
                            />
                        )}
                        <span className={block('name')} title={row.name}>
                            {row.name}
                        </span>
                        <Icon className={block('insert-icon')} data={insertIcon} size={16} />
                    </Link>
                );
            }
            return (
                <span className={block('item')}>
                    {row.sort && (
                        <Icon
                            className={block('sort-icon')}
                            data={row.sort.ascending ? sortUpIcon : sortDownIcon}
                            size={16}
                        />
                    )}
                    <span className={block('name')} title={row.name}>
                        {row.name}
                    </span>
                </span>
            );
        },
    },
    {
        name: 'type',
        header: 'type.column-header',
        sortable: false,
        render({row}) {
            return <DataType {...row.type} />;
        },
    },
];

interface SchemaTableProps {
    schemaFields: SchemaField[];
    className?: string;
}

export function SchemaTable({className, schemaFields}: SchemaTableProps) {
    return (
        <div className={block(null, className)}>
            <DataTable theme="yandex-cloud" columns={columns} data={schemaFields} startIndex={1} />
        </div>
    );
}
