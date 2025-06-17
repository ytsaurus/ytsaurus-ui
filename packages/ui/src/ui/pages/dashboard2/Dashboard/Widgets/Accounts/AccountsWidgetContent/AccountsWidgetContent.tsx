import React from 'react';
import {ProgressTheme, Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {useAccountsQuery} from '../../../../../../store/api/dashboard2/accounts';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {useAutoHeight} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-autoheight';

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
    [key: string]: any;
};

const columnHelper = createColumnHelper<AccountInfo>();

// 1 react-grid height value ~ 25.3px
const accountsLayout = {
    baseHeight: 4.5,
    defaultHeight: 12,

    rowHeight: 1.9,

    minWidth: 10,
};

export function AccountsWidgetContent(props: PluginWidgetProps) {
    const {data} = props;

    const {
        data: accounts,
        isLoading,
        isFetching,
        error,
    } = useAccountsQuery({
        accountsList: data.accounts as string[],
        medium: data?.disk_columns ? (data.disk_columns as ({name: string})[]).map(item => item.name) : undefined,
    });

    const columns = [
        columnHelper.accessor('name', {
            cell: (name) => <AccountsNameCell name={name.getValue()} />,
            header: () => <Text variant={'subheader-1'}>{'Name'}</Text>,
            maxSize: 200,
        }),
    ];

    if ((data?.columns as {name: string}[] | undefined)?.length) {
        columns.push(...((data?.columns as {name: string}[])?.map(column =>
            columnHelper.accessor(column.name === 'Chunks' ? 'chunkCount' : 'nodeCount', {
                cell: (item) =>  <AccountsProgressCell type={'Number'} {...item.getValue()} />,
                header: () => <Text variant={'subheader-1'}>{column.name}</Text>,
            }),
        )));
    }

    if ((data?.disk_columns as {name: string}[] | undefined)?.length) {
        columns.push(...((data?.disk_columns as {name: string}[])?.map(column =>
            columnHelper.accessor(column.name, {
                cell: (medium) =>  <AccountsProgressCell type={'Bytes'} {...medium.getValue()} />,
                header: (header) => <Text variant={'subheader-1'}>{header.column.id}</Text>,
            }),
        )));
    }

    useAutoHeight(props, accountsLayout, accounts?.length || 0);

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
