import React from 'react';
import {Progress} from '@gravity-ui/uikit';
import {Table} from '@gravity-ui/table';
import {type ColumnDef, createColumnHelper} from '@gravity-ui/table/tanstack';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

//const WidgetWithTable = withTable<Pool>(Table);

type Pool = {
    pool_operation: string;
    cpu: number;
    ram: number;
    operations: number;
};

const columnHelper = createColumnHelper<Pool>();

const columns = [
    // {id: 'pool_operation', name: 'Pool/Operation'},
    // {id: 'cpu', name: 'CPU', template: (item: any) => <Progress value={item['cpu']} />},
    // {id: 'ram', name: 'RAM', template: (item: any) => <Progress value={item['ram']} />},
    // {
    //     id: 'operations',
    //     name: 'Operations',
    //     template: (item: any) => <Progress value={item['operations']} />,
    // },
    columnHelper.accessor('pool_operation', {
        cell: (pool) => pool.getValue(),
    }),
    columnHelper.accessor('cpu', {
        cell: (cpu) => <Progress value={cpu.getValue()} />,
    }),
    columnHelper.accessor('ram', {
        cell: (ram) => <Progress value={ram.getValue()} />,
    }),
    columnHelper.accessor('operations', {
        cell: (operations) => <Progress value={operations.getValue()} />,
    }),
];

const data = [
    {
        pool_operation: 'abc:root1',
        cpu: 80,
        ram: 10,
        operaions: 50,
    },
    {
        pool_operation: 'abc:root1',
        cpu: 80,
        ram: 10,
        operaions: 50,
    },
    {
        pool_operation: 'abc:root1',
        cpu: 80,
        ram: 10,
        operaions: 50,
    },
    {
        pool_operation: 'abc:root1',
        cpu: 80,
        ram: 10,
        operaions: 50,
    },
];

export function PoolsWidgetContent(props: PluginWidgetProps) {
    return <WidgetTable data={data} columns={columns} />;
}

function Pool(item: any, type: string) {
    return <Progress value={item[type]} />;
}
