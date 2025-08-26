import React, {FC} from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {useSelector} from 'react-redux';
import {getQueryTokens} from '../../../store/selectors/settings/settings-queries';
import {QueryTokenRemoveButton} from './QueryTokenRemoveButton';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
import {Flex, Text} from '@gravity-ui/uikit';
import {QueryToken} from '../../../../shared/constants/settings-types';

const columns: ColumnDef<QueryToken>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'cluster',
        header: 'Cluster',
    },
    {
        accessorKey: 'path',
        header: 'Path',
    },
    {
        accessorKey: 'id',
        header: '',
        cell: ({row}) => {
            return (
                <Flex justifyContent="flex-end" alignItems="flex-start">
                    <QueryTokenRemoveButton name={row.original.name} />
                </Flex>
            );
        },
    },
];

export const QueryTokenTable: FC = () => {
    const tokens = useSelector(getQueryTokens);
    const table = useTable({data: tokens, columns});

    if (!tokens.length) return <Text color="secondary">No tokens</Text>;

    return <Table table={table} />;
};
