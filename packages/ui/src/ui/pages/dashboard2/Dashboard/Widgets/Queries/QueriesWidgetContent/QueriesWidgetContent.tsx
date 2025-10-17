import React from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {RootState} from '../../../../../../store/reducers';
import {getQueryFilterState} from '../../../../../../store/selectors/dashboard2/queries';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {WidgetText} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

import {QueryStatus} from '../../../../../../types/query-tracker';

import {General} from './cells/General';
import {Engine} from './cells/Engine';
import {Duration} from './cells/Duration';
import {StartTime} from './cells/StartTime';

import {useQueriesWidget} from '../hooks/use-queries-widget';
import type {QueriesWidgetProps} from '../types';

import i18n from '../i18n';

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
        header: () => i18n('field_name'),
        maxSize: 150,
    }),
    columnHelper.accessor('engine', {
        cell: (engine) => <Engine engine={engine.getValue()} />,
        header: () => i18n('field_type'),
    }),
    columnHelper.accessor('author', {
        cell: (author) => <WidgetText>{author.getValue()}</WidgetText>,
        header: () => i18n('field_author'),
        maxSize: 150,
    }),
    columnHelper.accessor('duration', {
        cell: (duration) => <Duration duration={duration.getValue()} />,
        header: () => i18n('field_duration'),
    }),
    columnHelper.accessor('start_time', {
        cell: (startTime) => <StartTime startTime={startTime.getValue()} />,
        header: () => i18n('field_start-time'),
    }),
];

export function QueriesWidgetContent(props: QueriesWidgetProps) {
    const {queries, error, isLoading} = useQueriesWidget(props);

    const queryState = useSelector((state: RootState) => getQueryFilterState(state, props.id));
    const itemsName = i18n(`fallback-item_${queryState || 'all'}`);

    return (
        <WidgetTable
            data={queries || []}
            columns={columns}
            itemHeight={40}
            isLoading={isLoading}
            fallback={{itemsName}}
            error={error}
        />
    );
}
