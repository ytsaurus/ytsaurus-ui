import React, {useMemo} from 'react';
import {Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import format from '../../../../../../common/hammer/format';

import {AccountInfo} from '../../../../../../store/api/dashboard2/accounts/accounts';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {WidgetText} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

import {useAccountsWidget} from '../hooks/use-accounts-widget';
import type {AccountsWidgetProps} from '../types';

import i18n from '../i18n';

import {AccountsProgressCell} from './cells/AccountsProgressCell';
import {AccountsNameCell} from './cells/AccountsNameCell';

import './AccountsWidgetContent.scss';

const columnHelper = createColumnHelper<AccountInfo>();

export function AccountsWidgetContent(props: AccountsWidgetProps) {
    const {accounts, userColumns, isLoading, error, type} = useAccountsWidget(props);

    const columns = useMemo(() => {
        const cols = [
            columnHelper.accessor('general', {
                cell: (general) => <AccountsNameCell {...general.getValue()} />,
                header: () => <Text variant={'subheader-1'}>{i18n('field_name')}</Text>,
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
                                    <WidgetText variant={'subheader-1'}>{column.name}</WidgetText>
                                ),
                                maxSize: 200,
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
                            <WidgetText variant={'subheader-1'}>
                                {format.ReadableField(header.column.id)}
                            </WidgetText>
                        ),
                        maxSize: 200,
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
            fallback={{itemsName: i18n(`fallback-item_${type}`)}}
            error={error}
        />
    );
}
