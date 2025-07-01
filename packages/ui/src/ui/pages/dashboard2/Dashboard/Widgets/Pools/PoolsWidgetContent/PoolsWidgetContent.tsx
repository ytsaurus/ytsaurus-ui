import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {PoolCell} from './cells/Pool';
import {ResourceCell} from './cells/Resource';

import {usePoolsWidget} from './use-pools-widget';

export type PoolResource = {
    value: number;
    usage: number;
    garantee: number;
};

type Pool = {
    general: {pool: string; tree: string};
    cpu: PoolResource;
    memory: PoolResource;
    gpu: PoolResource;
    operations: PoolResource;
};

const columnHelper = createColumnHelper<Pool>();

const columns = [
    columnHelper.accessor('general', {
        id: 'general',
        cell: (pool) => <PoolCell {...pool.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Pool'}</Text>,
        maxSize: 150,
    }),
    columnHelper.accessor('gpu', {
        id: 'gpu',
        cell: (gpu) => <ResourceCell {...gpu.getValue()} type={'gpu'} />,
        header: () => <Text variant={'subheader-1'}>{'GPU'}</Text>,
    }),
    columnHelper.accessor('cpu', {
        id: 'cpu',
        cell: (cpu) => <ResourceCell {...cpu.getValue()} type={'cpu'} />,
        header: () => <Text variant={'subheader-1'}>{'CPU'}</Text>,
    }),
    columnHelper.accessor('memory', {
        id: 'memory',
        cell: (memory) => <ResourceCell {...memory.getValue()} type={'memory'} />,
        header: () => <Text variant={'subheader-1'}>{'RAM'}</Text>,
    }),
    columnHelper.accessor('operations', {
        id: 'operations',
        cell: (operations) => <ResourceCell {...operations.getValue()} type={'operations'} />,
        header: () => <Text variant={'subheader-1'}>{'Operations'}</Text>,
    }),
];

export function PoolsWidgetContent(props: PluginWidgetProps) {
    const {
        visibleColumns,
        data: {pools, isFetching, isLoading, error},
    } = usePoolsWidget(props);

    return (
        <WidgetTable
            data={pools || []}
            columns={columns}
            columnsVisibility={visibleColumns}
            itemHeight={50}
            isLoading={isLoading || isFetching}
            fallback={{itemsName: 'pools'}}
            error={error}
        />
    );
}
