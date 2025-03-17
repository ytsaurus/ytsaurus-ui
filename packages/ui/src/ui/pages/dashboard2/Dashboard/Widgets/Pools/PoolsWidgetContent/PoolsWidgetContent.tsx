import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';

import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';

import {Layouts} from '../../../../../../constants/dashboard2';

import {Resource} from './cells/Resource';

import {usePools} from './use-pools';

export type PoolResource = {
    value: number;
    usage: number;
    garantee: number;
};

type Pool = {
    name: string;
    cpu: PoolResource;
    memory: PoolResource;
    gpu: PoolResource;
    operations: PoolResource;
};

const columnHelper = createColumnHelper<Pool>();

const columns = [
    columnHelper.accessor('name', {
        cell: (pool) => pool.getValue(),
        header: () => <Text variant={'subheader-1'}>{'Pool'}</Text>,
    }),
    columnHelper.accessor('cpu', {
        cell: (cpu) => <Resource {...cpu.getValue()} type={'cpu'} />,
        header: () => <Text variant={'subheader-1'}>{'CPU'}</Text>,
    }),
    columnHelper.accessor('memory', {
        cell: (memory) => <Resource {...memory.getValue()} type={'memory'} />,
        header: () => <Text variant={'subheader-1'}>{'RAM'}</Text>,
    }),
    columnHelper.accessor('operations', {
        cell: (operations) => <Resource {...operations.getValue()} type={'operations'} />,
        header: () => <Text variant={'subheader-1'}>{'Operations'}</Text>,
    }),
    columnHelper.accessor('gpu', {
        cell: (gpu) => <Resource {...gpu.getValue()} type={'gpu'} />,
        header: () => <Text variant={'subheader-1'}>{'GPU'}</Text>,
    }),
];

export const Pools: LayoutConfig = {
    baseHeight: 8,
    defaultHeight: Layouts['pools'].h,

    rowMultiplier: 1.5,

    minHeight: 12,
    minWidth: 13,
};

export function PoolsWidgetContent(props: PluginWidgetProps) {
    const {pools, isLoading} = usePools();
    useOnLoadSize(props, Pools, pools.length || 0);
    return (
        <>
            {isLoading ? (
                <WidgetSkeleton amount={4} itemHeight={50} />
            ) : (
                <WidgetTable data={pools || []} columns={columns} />
            )}
        </>
    );
}
