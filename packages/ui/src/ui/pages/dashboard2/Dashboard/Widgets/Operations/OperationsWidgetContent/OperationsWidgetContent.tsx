import React from 'react';
import {useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {RootState} from '../../../../../../store/reducers';
import {useOperationsQuery} from '../../../../../../store/api/dashboard2/operations';
import {
    selectOperationsResponsibleType,
    selectOperationsState,
} from '../../../../../../store/reducers/dashboard2/operations';
import {getCluster} from '../../../../../../store/selectors/global';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';
import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';

import {Layouts} from '../../../../../../constants/dashboard2';

import {Title} from './cells/Title';
import {UserPool} from './cells/UserPool';
import {StartTime} from './cells/StartTime';
import {State} from './cells/State';

import './OperationsWidgetContent.scss';

const block = b('yt-operations-widget-content');

type Operations = {
    title: {
        title: string;
        id: string;
    };
    userPool: {
        user: string;
        pools: {tree: string; pool: string}[];
    };
    startTime: string;
    progress: any;
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

const OperaionsLayout: LayoutConfig = {
    baseHeight: 6,
    defaultHeight: Layouts['operations'].h,

    rowMultiplier: 1.5,

    minHeight: 8,
    minWidth: 13,
};

export function OperationsWidgetContent(props: PluginWidgetProps) {
    const {id, data} = props;
    console.log(data);
    const cluster = useSelector(getCluster);

    const state = useSelector((state: RootState) => selectOperationsState(state, id));
    const responsibleType = useSelector((state: RootState) =>
        selectOperationsResponsibleType(state, id),
    );

    const responsibles = data.responsibles as Array<{value: string; type: string}>;

    const {data: operations, isLoading} = useOperationsQuery({
        cluster,
        responsibleType,
        state,
        responsibles,
    });
    //useOnLoadSize(props, OperaionsLayout, data?.length || 0);
    console.log(operations)
    return (
        <>
            {isLoading ? (
                <WidgetSkeleton amount={5} itemHeight={40} />
            ) : (
                <WidgetTable data={operations || []} columns={columns} className={block()} />
            )}
        </>
    );
}
