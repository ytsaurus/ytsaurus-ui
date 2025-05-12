import React from 'react';
import {ProgressTheme, Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {useAccountsQuery} from '../../../../../../store/api/dashboard2/accounts';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {AccountsProgressCell} from './cells/AccountsProgressCell';
import {AccountsNameCell} from './cells/AccountsNameCell';

import './AccountsWidgetContent.scss';

export type Resource = Partial<{
    committed: number;
    uncommitted: number;
    total: number;
    limit: number;
    theme: ProgressTheme;
    progress: number;
    progressText: string;
}>;

type AccountInfo = {
    name: string;
    chunkCount?: Resource;
    diskSpace?: Resource;
    nodeCount?: Resource;
};

const columnHelper = createColumnHelper<AccountInfo>();

const columns = [
    columnHelper.accessor('name', {
        cell: (name) => <AccountsNameCell name={name.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Name'}</Text>,
        maxSize: 200,
    }),
    columnHelper.accessor('diskSpace', {
        cell: (diskSpace) => <AccountsProgressCell type={'Bytes'} {...diskSpace.getValue()} />,
        header: () => (
            <Text variant={'subheader-1'} whiteSpace={'nowrap'}>
                {'Disk space'}
            </Text>
        ),
    }),
    columnHelper.accessor('nodeCount', {
        cell: (nodeCount) => <AccountsProgressCell type={'Number'} {...nodeCount.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Nodes'}</Text>,
    }),
    columnHelper.accessor('chunkCount', {
        cell: (chunksCount) => <AccountsProgressCell type={'Number'} {...chunksCount.getValue()} />,
        header: () => <Text variant={'subheader-1'}>{'Chunks'}</Text>,
    }),
];

export function AccountsWidgetContent(props: PluginWidgetProps) {
    const {data} = props;

    const {
        data: accounts,
        isLoading,
        isFetching,
        error,
    } = useAccountsQuery({
        accountsList: data.accounts as string[],
        medium: data.medium as string | undefined,
    });

    return (
        <WidgetTable
            columns={columns}
            data={accounts || []}
            itemHeight={50}
            isLoading={isLoading || isFetching}
            fallback={{itemsName: 'accounts'}}
            error={error}
        />
    );
}
