import React, {useMemo} from 'react';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import hammer from '../../../../../../common/hammer';

import {AccountInfo} from '../../../../../../store/api/dashboard2/accounts/accounts';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {useAccountsWidget} from '../hooks/use-accounts-widget';

import {AccountsProgressCell} from './cells/AccountsProgressCell';
import {AccountsNameCell} from './cells/AccountsNameCell';

import './AccountsWidgetContent.scss';

const columnHelper = createColumnHelper<AccountInfo>();

export function AccountsWidgetContent(props: PluginWidgetProps) {
    const {accounts, userColumns, isLoading, error, type} = useAccountsWidget(props);

    const columns = useMemo(() => {
        const cols = [
            columnHelper.accessor('name', {
                cell: (name) => <AccountsNameCell name={name.getValue()} />,
                header: () => <Text variant={'subheader-1'}>{'Name'}</Text>,
                maxSize: 200,
            }),
        ];

        if (userColumns?.length) {
            cols.push(
                ...userColumns.map((column) => {
                    if (column.name === 'Chunks' || column.name === 'Nodes') {
                        return columnHelper.accessor(
                            column.name === 'Chunks' ? 'chunkCount' : 'nodeCount',
                            {
                                cell: (item) => {
                                    const value = item.getValue();
                                    return (
                                        <AccountsProgressCell
                                            type={'Number'}
                                            {...(typeof value === 'object' && value !== null
                                                ? value
                                                : {})}
                                        />
                                    );
                                },
                                header: () => (
                                    <Text variant={'subheader-1'} whiteSpace={'nowrap'} ellipsis>
                                        {column.name}
                                    </Text>
                                ),
                            },
                        );
                    }
                    return columnHelper.accessor(column.name, {
                        cell: (medium) => {
                            const value = medium.getValue();
                            return (
                                <AccountsProgressCell
                                    type={'Bytes'}
                                    {...(typeof value === 'object' && value !== null ? value : {})}
                                />
                            );
                        },
                        header: (header) => (
                            <Text variant={'subheader-1'} whiteSpace={'nowrap'} ellipsis>
                                {hammer.format['ReadableField'](header.column.id)}
                            </Text>
                        ),
                    });
                }),
            );
        }
        return cols;
    }, [userColumns]);

    return (
        <WidgetTable
            columns={columns}
            data={accounts || []}
            itemHeight={50}
            isLoading={isLoading}
            fallback={{itemsName: `${type} accounts`}}
            error={error}
        />
    );
}
