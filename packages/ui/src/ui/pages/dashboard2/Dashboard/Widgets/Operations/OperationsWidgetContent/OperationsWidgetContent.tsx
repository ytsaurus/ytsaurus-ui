import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Link, Progress, Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Table} from '@gravity-ui/table';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {
    LayoutConfig,
    useOnLoadSize,
} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-on-load-size';

import './OperationsWidgetContent.scss';

const block = b('yt-operations-widget-content');

const columns = [
    {id: 'title', name: 'Title'},
    {id: 'user_pool', name: 'User/Pool', template: userPoolTemplate},
    {id: 'start_time', name: 'Start time', template: startTimeTemplate},
    {id: 'state', name: 'State/Progress', template: stateTemplate},
];

const data = [
    {
        title: 'Operation 1',
        user: 'robot-yt-front',
        pool: 'yt-front',
        start_time: '17 Aug 2022 13:14:23',
        progress: 84,
    },
    {
        title: 'Operation 1',
        user: 'robot-yt-front',
        pool: 'yt-front',
        start_time: '17 Aug 2022 13:14:23',
        progress: 84,
    },
    {
        title: 'Operation 1',
        user: 'robot-yt-front',
        pool: 'yt-front',
        start_time: '17 Aug 2022 13:14:23',
        progress: 84,
    },
];

//const WidgetWithTable = withTable<any>(Table);

const OperaionsLayout: LayoutConfig = {
    baseHeight: 6,
    defaultHeight: 12,

    rowMultiplier: 2,

    minHeight: 8,
    minWidth: 13,
};

export function OperationsWidgetContent(props: PluginWidgetProps) {
    useOnLoadSize(props, OperaionsLayout, data);
    return <WidgetTable data={data} columns={columns} className={block()} />;
}

function stateTemplate(item: any) {
    return <Progress text={item.state} theme={'info'} value={item.progress} />;
}

function startTimeTemplate(item: any) {
    return <Text className={block('start-time-column')}>{item.start_time}</Text>;
}

function userPoolTemplate(item: any) {
    return (
        <Flex direction={'column'}>
            <Text>{item.user}</Text>
            <Link href={''}>{item.pool}</Link>
        </Flex>
    );
}
