import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {RootState} from '../../../../../../store/reducers';
import {useAccountsQuery} from '../../../../../../store/api/dashboard2/accounts';
import {
    getAccountsList,
    getAccountsTypeFilter,
} from '../../../../../../store/selectors/dashboard2/accounts';
import {useUsableAccountsQuery} from '../../../../../../store/api/accounts';
import {isDeveloper} from '../../../../../../store/selectors/global/is-developer';
import {getCluster} from '../../../../../../store/selectors/global';
import {AccountInfo} from '../../../../../../store/api/dashboard2/accounts/accounts';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {ColumnSortByInfo} from '../../../../../../pages/navigation/modals/TableMergeSortModal/TableSortByControl';

import {AccountsProgressCell} from './cells/AccountsProgressCell';
import {AccountsNameCell} from './cells/AccountsNameCell';

import './AccountsWidgetContent.scss';

const columnHelper = createColumnHelper<AccountInfo>();

type AccountsWidgetData = {
    accounts?: string[];
    disk_columns?: ColumnSortByInfo[];
    columns?: ColumnSortByInfo[];
};

export function AccountsWidgetContent(props: PluginWidgetProps) {
    const {data}: {data: AccountsWidgetData & PluginWidgetProps['data']} = props;

    const cluster = useSelector(getCluster);
    const type = useSelector((state: RootState) => getAccountsTypeFilter(state, props.id));
    const isAdmin = useSelector(isDeveloper);

    useUsableAccountsQuery({cluster}, {skip: isAdmin});

    const accountsList = useSelector((state: RootState) =>
        getAccountsList(state, props.id, data?.accounts || []),
    );

    const {
        data: accounts,
        isLoading,
        isFetching,
        error,
    } = useAccountsQuery({
        accountsList,
        medium: data?.disk_columns ? data.disk_columns.map((item) => item.name) : undefined,
    });

    const columns = useMemo(() => {
        const cols = [
            columnHelper.accessor('name', {
                cell: (name) => <AccountsNameCell name={name.getValue()} />,
                header: () => <Text variant={'subheader-1'}>{'Name'}</Text>,
                maxSize: 200,
            }),
        ];
        if (data?.disk_columns?.length) {
            cols.push(
                ...data.disk_columns.map((column) =>
                    columnHelper.accessor(column.name, {
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
                                {header.column.id}
                            </Text>
                        ),
                    }),
                ),
            );
        }

        if (data?.columns?.length) {
            cols.push(
                ...data.columns.map((column) =>
                    columnHelper.accessor(column.name === 'Chunks' ? 'chunkCount' : 'nodeCount', {
                        cell: (item) => {
                            const value = item.getValue();
                            return (
                                <AccountsProgressCell
                                    type={'Number'}
                                    {...(typeof value === 'object' && value !== null ? value : {})}
                                />
                            );
                        },
                        header: () => (
                            <Text variant={'subheader-1'} whiteSpace={'nowrap'} ellipsis>
                                {column.name}
                            </Text>
                        ),
                    }),
                ),
            );
        }
        return cols;
    }, [data?.columns, data?.disk_columns]);

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
