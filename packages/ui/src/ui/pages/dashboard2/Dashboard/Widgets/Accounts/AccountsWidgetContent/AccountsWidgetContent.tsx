import React from 'react';
import {Progress} from '@gravity-ui/uikit';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
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

const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'name',
        //meta: {defaultSortOrder: 'desc', sort: (a, b) => a.name.localeCompare(b.name)},
    },
    {accessorKey: 'disk_space'},
    {accessorKey: 'nodes'},
    {accessorKey: 'chunks'},
];

const data = [
    {
        name: 'Account 1',
        chuks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chuks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chuks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chuks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chuks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
    {
        name: 'Account 2',
        chuks: '17 891 + 0 / 202 048',
        pool: 'yt-front',
        disk_space: '293.15 GiB + 0 B / 1.00 TiB',
        nodes: '12 073 + 0 / 15 000',
    },
];

export function AccountsWidgetContent(props: PluginWidgetProps) {
    useOnLoadSize(props, Accounts, data);

    return <WidgetTable columns={columns} data={data} />;
}

function diskSpaceTemplate(item: any) {
    return <Progress text={item.disk_space} theme={'success'} value={item.disk_space} />;
}

function nodesTemplate(item: any) {
    return <Progress text={item.nodes} theme={'success'} value={item.progress} />;
}

function chunksTemplate(item: any) {
    return <Progress text={item.nodes} theme={'success'} value={item.progress} />;
}
