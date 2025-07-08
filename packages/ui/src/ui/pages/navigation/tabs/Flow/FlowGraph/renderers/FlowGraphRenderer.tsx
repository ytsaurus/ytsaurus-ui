import React from 'react';
import cn from 'bem-cn-lite';

import {Dialog, Flex, Icon, Text} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {FlowMessage, FlowNodeStatus} from '../../../../../../../shared/yt-types';

import format from '../../../../../../common/hammer/format';
import {ExpandButton} from '../../../../../../components/ExpandButton';
import Yson from '../../../../../../components/Yson/Yson';
import {ClickableText} from '../../../../../../components/ClickableText/ClickableText';
import {YTErrorInline} from '../../../../../../containers/YTErrorInline/YTErrorInline';

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

type FlowMessagesProps = {data?: Array<FlowMessage>};

export function FlowMessages({data}: FlowMessagesProps) {
    const [visible, setVisible] = React.useState(false);

    return !data?.length ? null : (
        <div className={block('messages')}>
            <ClickableText onClick={() => setVisible(true)}>Messages ({data.length})</ClickableText>
            {visible && <FlowMessagesDialog data={data} onClose={() => setVisible(false)} />}
        </div>
    );
}

function FlowMessagesDialog({data, onClose}: FlowMessagesProps & {onClose(): void}) {
    return (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header caption="Messages" />
            <Dialog.Body className={block('messages-body')}>
                {data?.map((item, index) => <FlowMessageItem item={item} key={index} />)}
            </Dialog.Body>
        </Dialog>
    );
}

function FlowMessageItem({item}: {item: FlowMessage}) {
    const {level, yson, error} = item;
    const theme = STATUS_TO_BG_THEME[level];
    const errorType = theme === 'warning' ? 'alert' : undefined;
    return (
        <div className={block('message', {theme})}>
            {Boolean(error) ? (
                <YTErrorInline error={error} type={errorType} />
            ) : Boolean(yson) ? (
                <FlowMessageItemYson item={item} />
            ) : (
                item.text
            )}
        </div>
    );
}

function FlowMessageItemYson({item}: {item: FlowMessage}) {
    const [expanded, setExpanded] = React.useState(false);

    const {yson, text} = item;
    return (
        <Flex gap={1} alignItems="baseline">
            <ExpandButton expanded={expanded} toggleExpanded={() => setExpanded(!expanded)} />
            <span>
                {text ?? format.NO_VALUE}
                {expanded && <Yson value={yson} />}
            </span>
        </Flex>
    );
}
