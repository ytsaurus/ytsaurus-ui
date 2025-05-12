import React from 'react';
import b from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {OperationProgressInfo} from '../../../../../../store/api/dashboard2/operations/operations';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {Title} from './cells/Title';
import {UserPool} from './cells/UserPool';
import {StartTime} from './cells/StartTime';
import {State} from './cells/State';

import {useOperationsWidget} from './use-operations-widget';

import './OperationsWidgetContent.scss';

const block = b('yt-operations-widget-content');

type Operations = {
    title: {
        title: string;
        id: string;
    };
    userPool: {
        user: string;
        pools: {tree: string; pool: string[]}[];
    };
    startTime?: string;
    progress: OperationProgressInfo;
};

const columnHelper = createColumnHelper<Operations>();

const columns = [
    columnHelper.accessor('title', {
        header: () => <Text variant={'subheader-1'}>{'Title'}</Text>,
        cell: (title) => <Title title={title.getValue()} />,
        maxSize: 200,
    }),
    columnHelper.accessor('userPool', {
        header: () => <Text variant={'subheader-1'}>{'User/Pools'}</Text>,
        cell: (userPool) => <UserPool userPool={userPool.getValue()} />,
    }),
    columnHelper.accessor('startTime', {
        header: () => <Text variant={'subheader-1'}>{'Start time'}</Text>,
        cell: (startTime) => <StartTime startTime={startTime.getValue()} />,
    }),
    columnHelper.accessor('progress', {
        header: () => <Text variant={'subheader-1'}>{'State'}</Text>,
        cell: (progress) => <State progress={progress.getValue()} />,
    }),
];

export function OperationsWidgetContent(props: PluginWidgetProps) {
    const {
        filters: {state},
        data: {operations, isLoading, isFetching, error},
    } = useOperationsWidget(props);

    return (
        <WidgetTable
            data={operations || []}
            columns={columns}
            className={block()}
            itemHeight={60}
            isLoading={isLoading || isFetching}
            fallback={{itemsName: `${!state || state === 'all' ? '' : state + ' '}operations`}}
            error={error}
        />
    );
}
