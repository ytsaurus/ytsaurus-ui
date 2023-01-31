import DataTable, {Column, Settings} from '@yandex-cloud/react-data-table';
import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {QueryResultColumn, QueryResultReadyState} from '../../module/query_result/types';
import block from 'bem-cn-lite';
import './index.scss';
import {MOVING} from '@yandex-cloud/react-data-table/build/esm/lib/constants';
import DataType from '../../../../components/SchemaDataType/DataType/DataType';

const b = block('query-result-scheme');

const settings: Settings = {
    sortable: false,
    displayIndices: true,
    stripedRows: true,
    externalSort: true,
    stickyHead: MOVING,
    stickyTop: 0,
};

const config: Column<QueryResultColumn>[] = [
    {
        name: 'name',
        header: 'Name',
        sortable: false,
        width: 'auto',
        render({row}) {
            return (
                <span className={b('item')}>
                    <span className={b('name')} title={row.name}>
                        {row.name}
                    </span>
                </span>
            );
        },
    },
    {
        name: 'type',
        header: 'Type',
        width: 'auto',
        sortable: false,
        render({row}) {
            return <DataType {...row.type} />;
        },
    },
];

const SchemeTable = React.memo(function SchemeTable({result}: {result: QueryResultReadyState}) {
    return (
        <DataTable
            theme="yandex-cloud"
            columns={config}
            data={result.columns}
            startIndex={1}
            settings={settings}
        />
    );
});

export function YQLSchemeTable({
    result,
    className,
}: {
    result: QueryResultReadyState;
    className?: string;
}) {
    return (
        <div className={b(null, className)}>
            <Text variant="subheader-2" as={'div'} className={b('title')}>
                Scheme
            </Text>
            <div className={b('table-wrap')}>
                <SchemeTable result={result} />
            </div>
        </div>
    );
}
