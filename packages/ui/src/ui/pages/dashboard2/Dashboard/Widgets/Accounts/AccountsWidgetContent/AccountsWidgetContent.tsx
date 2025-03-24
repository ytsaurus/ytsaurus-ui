import React from 'react';
import {Progress} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import b from 'bem-cn-lite';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';

import './AccountsWidgetContent.scss';

//const WidgetWithTable = withTable(Table);

const block = b('yt-accounts-widget');

export const Accounts: LayoutConfig = {
    baseHeight: 6,
    defaultHeight: 12,

    rowMultiplier: 1,

    minHeight: 7,
    minWidth: 12,
};

const columnHelper = createColumnHelper<Account>();

type Account = {
    name: string;
    chunks: string;
    pool: string;
    disk_space: string;
    nodes: string;
};

const columns = [
    columnHelper.accessor('name', {
        cell: (name) => name.getValue(),
    }),
    columnHelper.accessor('disk_space', {
        cell: (disk_space) => <Progress theme={'success'} value={80} text={disk_space.getValue()} />,
    }),
    columnHelper.accessor('nodes', {
        cell: (nodes) => <Progress value={80} text={nodes.getValue()} />,
    }),
    columnHelper.accessor('chunks', {
        cell: (chunks) => <Progress value={80} text={chunks.getValue()} />,
    }),
];

const data = [
    {
        name: 'Account 1',
        chunks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chunks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chunks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chunks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chunks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chunks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
];

export function AccountsWidgetContent(props: PluginWidgetProps) {
    useOnLoadSize(props, Accounts, data);
    return <WidgetTable columns={columns} data={data} />;
}
