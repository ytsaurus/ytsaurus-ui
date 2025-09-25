import React from 'react';
import b from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {OperationProgressInfo} from '../../../../../../store/api/dashboard2/operations/operations';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {Title} from './cells/Title';
import {UserPool} from './cells/UserPool';
import {StartTime} from './cells/StartTime';
import {State} from './cells/State';

import {useOperationsWidget} from '../hooks/use-operations-widget';
import type {OperationsWidgetProps} from '../types';

import i18n from '../i18n';

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
        header: () => <Text variant={'subheader-1'}>{i18n('field_title')}</Text>,
        cell: (title) => <Title title={title.getValue()} />,
        maxSize: 200,
    }),
    columnHelper.accessor('userPool', {
        header: () => <Text variant={'subheader-1'}>{i18n('field_user-pools')}</Text>,
        cell: (userPool) => <UserPool userPool={userPool.getValue()} />,
        maxSize: 200,
    }),
    columnHelper.accessor('startTime', {
        header: () => <Text variant={'subheader-1'}>{i18n('field_start-time')}</Text>,
        cell: (startTime) => <StartTime startTime={startTime.getValue()} />,
    }),
    columnHelper.accessor('progress', {
        header: () => <Text variant={'subheader-1'}>{i18n('field_state')}</Text>,
        cell: (progress) => <State progress={progress.getValue()} />,
    }),
];

type StateFilter = 'running' | 'aborted' | 'completed' | 'failed' | 'pending' | 'all';

export function OperationsWidgetContent(props: OperationsWidgetProps) {
    const {
        filters: {state},
        data: {operations, isLoading, error},
    } = useOperationsWidget(props);

    return (
        <WidgetTable
            data={operations || []}
            columns={columns}
            className={block()}
            itemHeight={60}
            isLoading={isLoading}
            fallback={{
                itemsName: i18n(`fallback-item_${(state || 'all') as StateFilter}`),
            }}
            error={error}
        />
    );
}
