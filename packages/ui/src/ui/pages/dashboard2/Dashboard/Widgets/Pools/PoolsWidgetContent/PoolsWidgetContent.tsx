import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {PoolCell} from './cells/Pool';
import {ResourceCell} from './cells/Resource';

import {usePoolsWidget} from '../hooks/use-pools-widget';
import type {Pool, PoolsWidgetProps} from '../types';

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

export function PoolsWidgetContent(props: PoolsWidgetProps) {
    const {
        visibleColumns,
        data: {pools, isLoading, error},
    } = usePoolsWidget(props);

    return (
        <WidgetTable
            data={pools || []}
            columns={columns}
            columnsVisibility={visibleColumns}
            itemHeight={50}
            isLoading={isLoading}
            fallback={{itemsName: 'pools'}}
            error={error}
        />
    );
}
