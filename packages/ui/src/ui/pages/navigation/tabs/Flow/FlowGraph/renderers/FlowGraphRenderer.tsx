import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Icon, Text} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import {FlowMessage, FlowNodeStatus} from '../../../../../../../shared/yt-types';
import Yson from '../../../../../../components/Yson/Yson';

import './FlowGraphRenderer.scss';

const block = cn('yt-flow-graph-renderer');

export const STATUS_TO_BG_THEME: Partial<
    Record<FlowNodeStatus, 'success' | 'info' | 'warning' | 'danger'>
> = {
    warning: 'warning',
    alert: 'warning',
    error: 'danger',
    fatal: 'danger',
    maximum: 'danger',
};

export function FlowIcon({data}: {data?: SVGIconSvgrData}) {
    return !data ? null : (
        <Flex shrink={0}>
            <Icon className={block('icon')} data={data} />
        </Flex>
    );
}

export function FlowCaption2({text}: {text: React.ReactNode}) {
    return (
        <Text variant="caption-2" style={{lineHeight: '12px'}} ellipsis>
            {text}
        </Text>
    );
}

export function FlowCaption1({text}: {text: React.ReactNode}) {
    return (
        <Text variant="caption-1" color="secondary" ellipsis>
            {text}
        </Text>
    );
}

export function FlowMessages({data}: {data?: Array<FlowMessage>}) {
    return !data?.length ? null : (
        <div>
            <FlowCaption1 text={'Messages'} />
            {data?.map(({level, yson, text}, index) => {
                const theme = STATUS_TO_BG_THEME[level];
                return (
                    <div className={block('message', {theme})} key={index}>
                        {text?.length! > 0 && <FlowCaption1 text={text} />}
                        {Boolean(yson) && <Yson value={yson} />}
                    </div>
                );
            })}
        </div>
    );
}
