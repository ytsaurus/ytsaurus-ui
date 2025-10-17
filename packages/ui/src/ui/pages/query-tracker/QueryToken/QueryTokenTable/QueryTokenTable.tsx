import React, {FC} from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {useSelector} from '../../../../store/redux-hooks';
import {getQueryTokens} from '../../../../store/selectors/settings/settings-queries';
import {QueryTokenRemoveButton} from './QueryTokenRemoveButton';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
import {Button, Flex, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import {QueryToken} from '../../../../../shared/constants/settings-types';
import i18n from './i18n';
import cn from 'bem-cn-lite';
import './QueryTokenTable.scss';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {makeRoutedURL} from '../../../../store/location';
import {Page} from '../../../../../shared/constants/settings';

const block = cn('yt-query-token-table');

const columns: ColumnDef<QueryToken>[] = [
    {
        accessorKey: 'name',
        header: () => {
            return (
                <Text variant="subheader-1" color="secondary">
                    {i18n('field_name')}
                </Text>
            );
        },
        size: 110,
        cell: ({row}) => {
            return (
                <Tooltip content={row.original.name}>
                    <Text className={block('name')} ellipsis>
                        {row.original.name}
                    </Text>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: 'path',
        header: () => {
            return (
                <Text variant="subheader-1" color="secondary">
                    {i18n('field_cluster-and-path')}
                </Text>
            );
        },
        size: 400,
        cell: ({row}) => {
            const path = `${row.original.cluster}.${row.original.path}`;
            return (
                <Tooltip content={path}>
                    <Text className={block('path')} ellipsis>
                        {path}
                    </Text>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: 'id',
        header: '',
        size: 60,
        cell: ({row}) => {
            const {cluster, path, name} = row.original;
            return (
                <Flex className={block('actions')} gap={1}>
                    <Button
                        view="flat"
                        href={makeRoutedURL(`/${cluster}/${Page.NAVIGATION}`, {path})}
                        target="_blank"
                    >
                        <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                    </Button>
                    <QueryTokenRemoveButton name={name} />
                </Flex>
            );
        },
    },
];

export const QueryTokenTable: FC = () => {
    const tokens = useSelector(getQueryTokens);
    const table = useTable({data: tokens, columns});

    if (!tokens.length) return null;

    return <Table className={block()} table={table} />;
};
