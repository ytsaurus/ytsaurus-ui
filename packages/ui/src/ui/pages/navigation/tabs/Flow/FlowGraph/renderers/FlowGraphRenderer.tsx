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

export function FlowCaption2({
    text,
    children,
}: {
    text?: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <Text variant="inherit" style={{lineHeight: '17px'}} ellipsis>
            {text}
            {children}
        </Text>
    );
}

export function FlowCaption1({text}: {text: React.ReactNode}) {
    return (
        <Text variant="caption-2" color="secondary" ellipsis>
            {text}
        </Text>
    );
}

export function FlowMessages({data}: {data?: Array<FlowMessage>}) {
    return !data?.length ? null : (
        <div className={block('messages')}>
            <Text className={block('messages-header')} variant="inherit" color="secondary">
                Messages
            </Text>
            {data?.map(({level, yson, text}, index) => {
                const theme = STATUS_TO_BG_THEME[level];
                return (
                    <div className={block('message', {theme})} key={index}>
                        {text?.length! > 0 && <FlowCaption1 text={text} />}
                        {Boolean(yson) && <FlowCaption1 text={<Yson value={yson} />} />}
                    </div>
                );
            })}
        </div>
    );
}
