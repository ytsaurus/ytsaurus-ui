import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {useListQueriesQuery} from '../../../../../../store/api/yt';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';

type Query = {
    name: string;
    type: string;
    duration: string;
    author: string;
    status: string;
    started: string;
};

const Queries: LayoutConfig = {
    baseHeight: 8,
    defaultHeight: 17,

    rowMultiplier: 1.5,

    minHeight: 17,
    minWidth: 13,
};

const columnHelper = createColumnHelper<Query>();

const columns = [
    columnHelper.accessor('name', {
        cell: (name) => name.getValue(),
        header: () => 'Name',
    }),
    columnHelper.accessor('type', {
        cell: (type) => type.getValue(),
        header: () => 'Type',
    }),
    columnHelper.accessor('author', {
        cell: (author) => author.getValue(),
        header: () => 'Author',
    }),
    columnHelper.accessor('duration', {
        cell: (duration) => duration.getValue(),
        header: () => 'Duration',
    }),
    columnHelper.accessor('started', {
        cell: (started) => started.getValue(),
        header: () => 'Started',
    }),
];

export function QueriesWidgetContent(props: PluginWidgetProps) {
    const {data} = useListQueriesQuery();
    useOnLoadSize(props, Queries, 8);
    console.log(data);
    return <WidgetTable data={[]} columns={columns} />;
}
