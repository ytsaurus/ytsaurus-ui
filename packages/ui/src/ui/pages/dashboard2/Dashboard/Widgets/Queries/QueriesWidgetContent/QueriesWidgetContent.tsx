import React from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {WidgetText} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

import {QueryStatus} from '../../../../../../types/query-tracker';

import {General} from './cells/General';
import {Engine} from './cells/Engine';
import {Duration} from './cells/Duration';
import {StartTime} from './cells/StartTime';

import {useQueriesWidget} from '../hooks/use-queries-widget';

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
        cell: (author) => <WidgetText>{author.getValue()}</WidgetText>,
        header: () => 'Author',
        maxSize: 150,
    }),
    columnHelper.accessor('duration', {
        cell: (duration) => <Duration duration={duration.getValue()} />,
        header: () => 'Duration',
    }),
    columnHelper.accessor('start_time', {
        cell: (startTime) => <StartTime startTime={startTime.getValue()} />,
        header: () => <WidgetText>Start time</WidgetText>,
    }),
];

export function QueriesWidgetContent(props: PluginWidgetProps) {
    const {queries, error, isLoading} = useQueriesWidget(props);

    return (
        <WidgetTable
            data={queries || []}
            columns={columns}
            itemHeight={40}
            isLoading={isLoading}
            fallback={{itemsName: 'queries'}}
            error={error}
        />
    );
}
