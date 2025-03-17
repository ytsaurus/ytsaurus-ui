import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';
import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';

import {General} from './cells/General';
import {Engine} from './cells/Engine';
import {Duration} from './cells/Duration';
import {StartTime} from './cells/StartTime';

import {useQueries} from './use-queries';

type Query = {
    general: {
        state: string;
        name: string;
        id: string;
    };
    engine: string;
    duration: string;
    author: string;
    status: string;
    start_time: string;
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
    columnHelper.accessor('general', {
        cell: (general) => <General {...general.getValue()} />,
        header: () => 'Name',
    }),
    columnHelper.accessor('engine', {
        cell: (engine) => <Engine engine={engine.getValue()} />,
        header: () => 'Type',
    }),
    columnHelper.accessor('author', {
        cell: (author) => author.getValue(),
        header: () => 'Author',
    }),
    columnHelper.accessor('duration', {
        cell: (duration) => <Duration duration={duration.getValue()} />,
        header: () => 'Duration',
    }),
    columnHelper.accessor('start_time', {
        cell: (startTime) => <StartTime startTime={startTime.getValue()} />,
        header: () => 'Start time',
    }),
];

export function QueriesWidgetContent(props: PluginWidgetProps) {
    const {queries, isLoading} = useQueries();
    //useOnLoadSize(props, Queries, queries?.length || 0);
    return (
        <>
            {isLoading ? (
                <WidgetSkeleton amount={4} itemHeight={20} />
            ) : (
                <WidgetTable data={queries} columns={columns} />
            )}
        </>
    );
}
