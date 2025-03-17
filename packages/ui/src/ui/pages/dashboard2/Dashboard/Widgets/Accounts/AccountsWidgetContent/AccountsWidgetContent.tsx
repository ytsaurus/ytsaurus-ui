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

import {AccountsProgressCell} from './cells/AccountsProgressCell';
import {AccountsNameCell} from './cells/AccountsNameCell';

import {useAccounts} from './use-accounts';

import './AccountsWidgetContent.scss';

export const Accounts: LayoutConfig = {
    baseHeight: 8,
    defaultHeight: Layouts['accounts'].h,

    rowMultiplier: 1.5,

    minHeight: 10,
    minWidth: 13,
};

const columnHelper = createColumnHelper<Account>();

type Account = {
    name: string;
    chunkCount: any;
    diskSpace: any;
    nodeCount: any;
};

const columns = [
    columnHelper.accessor('name', {
        cell: (name) => <AccountsNameCell name={name.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Name'}</Text>,
        maxSize: 200,
    }),
    columnHelper.accessor('diskSpace', {
        cell: (diskSpace) => <AccountsProgressCell {...diskSpace.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Disk space'}</Text>,
    }),
    columnHelper.accessor('nodeCount', {
        cell: (nodeCount) => <AccountsProgressCell {...nodeCount.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Nodes'}</Text>,
    }),
    columnHelper.accessor('chunkCount', {
        cell: (chunksCount) => <AccountsProgressCell {...chunksCount.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Chunks'}</Text>,
    }),
];

export function AccountsWidgetContent(props: PluginWidgetProps) {
    const {accounts, isLoading} = useAccounts();
    useOnLoadSize(props, Accounts, accounts?.length || 0);

    return (
        <>
            {isLoading ? (
                <WidgetSkeleton amount={4} itemHeight={50} />
            ) : (
                <WidgetTable columns={columns} data={accounts} />
            )}
        </>
    );
}
