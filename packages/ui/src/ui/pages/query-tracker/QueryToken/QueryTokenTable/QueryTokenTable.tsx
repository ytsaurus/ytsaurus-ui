import React, {FC} from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {useSelector} from 'react-redux';
import {getQueryTokens} from '../../../../store/selectors/settings/settings-queries';
import {QueryTokenRemoveButton} from './QueryTokenRemoveButton';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
import {Flex, Text} from '@gravity-ui/uikit';
import {QueryToken} from '../../../../../shared/constants/settings-types';
import i18n from './i18n';

const columns: ColumnDef<QueryToken>[] = [
    {
        accessorKey: 'name',
        header: i18n('field_name'),
    },
    {
        accessorKey: 'cluster',
        header: i18n('field_cluster'),
    },
    {
        accessorKey: 'path',
        header: i18n('field_path'),
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

    if (!tokens.length) return <Text color="secondary">{i18n('context_no-tokens')}</Text>;

    return <Table table={table} />;
};
