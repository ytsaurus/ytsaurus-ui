import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {QueryStatus} from '../../../../../../types/query-tracker';

import {General} from './cells/General';
import {Engine} from './cells/Engine';
import {Duration} from './cells/Duration';
import {StartTime} from './cells/StartTime';

import {useQueriesWidget} from './use-queries-widget';

type Query = {
    general: {
        state: QueryStatus;
        name: string;
        id: string;
    };
    engine: string;
    duration: string;
    author: string;
    start_time: string;
};

const columnHelper = createColumnHelper<Query>();

const columns = [
    columnHelper.accessor('general', {
        cell: (general) => <General {...general.getValue()} />,
        header: () => 'Name',
        maxSize: 150,
    }),
    columnHelper.accessor('engine', {
        cell: (engine) => <Engine engine={engine.getValue()} />,
        header: () => 'Type',
    }),
    columnHelper.accessor('author', {
        cell: (author) => <Text>{author.getValue()}</Text>,
        header: () => 'Author',
    }),
    columnHelper.accessor('duration', {
        cell: (duration) => <Duration duration={duration.getValue()} />,
        header: () => 'Duration',
    }),
    columnHelper.accessor('start_time', {
        cell: (startTime) => <StartTime startTime={startTime.getValue()} />,
        header: () => <Text whiteSpace={'nowrap'}>Start time</Text>,
    }),
];

export function QueriesWidgetContent(props: PluginWidgetProps) {
    const {queries, error, isLoading, isFetching} = useQueriesWidget(props);

    return (
        <WidgetTable
            data={queries || []}
            columns={columns}
            itemHeight={40}
            isLoading={isLoading || isFetching}
            fallback={{itemsName: 'queries'}}
            error={error}
        />
    );
}
