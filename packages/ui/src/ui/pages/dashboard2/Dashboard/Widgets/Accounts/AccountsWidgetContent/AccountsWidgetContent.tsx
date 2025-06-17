import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {ProgressTheme, Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {RootState} from '../../../../../../store/reducers';
import {useAccountsQuery} from '../../../../../../store/api/dashboard2/accounts';
import {getAccountsList, getAccountsTypeFilter} from '../../../../../../store/selectors/dashboard2/accounts';
import {useUsableAccountsQuery} from '../../../../../../store/api/accounts';
import {isDeveloper} from '../../../../../../store/selectors/global/is-developer';

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

    const type = useSelector((state: RootState) => getAccountsTypeFilter(state, props.id));
    const isAdmin = useSelector(isDeveloper);

    useUsableAccountsQuery(undefined, {skip: isAdmin});

    const accountsList = useSelector((state: RootState) => getAccountsList(state, props.id, data?.accounts as string[]));

    const {
        data: accounts,
        isLoading,
        isFetching,
        error,
    } = useAccountsQuery({
        accountsList,
        medium: data?.disk_columns ? (data.disk_columns as ({name: string})[]).map(item => item.name) : undefined,
    });

    const columns = useMemo(() =>{
        const cols = [
            columnHelper.accessor('name', {
                cell: (name) => <AccountsNameCell name={name.getValue()} />,
                header: () => <Text variant={'subheader-1'}>{'Name'}</Text>,
                maxSize: 200,
            }),
        ];
        if ((data?.disk_columns as {name: string}[] | undefined)?.length) {
            cols.push(...((data?.disk_columns as {name: string}[])?.map(column =>
                columnHelper.accessor(column.name, {
                    cell: (medium) =>  <AccountsProgressCell type={'Bytes'} {...medium.getValue()} />,
                    header: (header) => <Text variant={'subheader-1'} whiteSpace={'nowrap'} ellipsis>{header.column.id}</Text>,
                }),
            )));
        }

        if ((data?.columns as {name: string}[] | undefined)?.length) {
            cols.push(...((data?.columns as {name: string}[])?.map(column =>
                columnHelper.accessor(column.name === 'Chunks' ? 'chunkCount' : 'nodeCount', {
                    cell: (item) =>  <AccountsProgressCell type={'Number'} {...item.getValue()} />,
                    header: () => <Text variant={'subheader-1'}>{column.name}</Text>,
                }),
            )));
        }
        return cols;
    }, [data?.columns, data?.disk_columns]);

    useAutoHeight(props, accountsLayout, accounts?.length || 0);

    return (
        <WidgetTable
            columns={columns}
            data={accounts || []}
            itemHeight={50}
            isLoading={isLoading || isFetching}
            fallback={{itemsName: `${type} accounts`}}
            error={error}
        />
    );
}
