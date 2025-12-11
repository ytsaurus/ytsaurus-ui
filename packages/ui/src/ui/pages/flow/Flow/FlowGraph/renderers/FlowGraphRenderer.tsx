import React from 'react';
import cn from 'bem-cn-lite';

import {Dialog, Flex, Icon, Text} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {FlowMessage, FlowNodeStatus} from '../../../../../../shared/yt-types';

import format from '../../../../../common/hammer/format';
import {ExpandButton} from '../../../../../components/ExpandButton';
import {YTErrorBlock} from '../../../../../components/Block/Block';
import Yson from '../../../../../components/Yson/Yson';
import {
    ClickableText,
    ClickableTextProps,
} from '../../../../../components/ClickableText/ClickableText';

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

type FlowMessagesProps = {data?: Array<FlowMessage>; paddingTop?: 'none'};

export function FlowMessages({data, paddingTop}: FlowMessagesProps) {
    const [visible, setVisible] = React.useState(false);

    const color = React.useMemo(() => {
        return data?.reduce(
            (acc, {level}) => {
                const theme = STATUS_TO_BG_THEME[level];
                if (theme === 'danger') {
                    return theme;
                }
                if (theme === 'warning') {
                    return theme;
                }
                return acc;
            },
            undefined as ClickableTextProps['color'],
        );
    }, [data]);

    return !data?.length ? null : (
        <div className={block('messages', {'padding-top': paddingTop})}>
            <ClickableText color={color} onClick={() => setVisible(true)}>
                Messages ({data.length})
            </ClickableText>
            {visible && <FlowMessagesDialog data={data} onClose={() => setVisible(false)} />}
        </div>
    );
}

function FlowMessagesDialog({data, onClose}: FlowMessagesProps & {onClose(): void}) {
    return (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header caption="Messages" />
            <Dialog.Body className={block('messages-body')}>
                {data?.map((item, index) => (
                    <FlowMessageItem item={item} key={index} initialExpanded={data?.length === 1} />
                ))}
            </Dialog.Body>
        </Dialog>
    );
}

function FlowMessageItem({item, initialExpanded}: {item: FlowMessage; initialExpanded: boolean}) {
    const {level, yson, error} = item;
    const theme = STATUS_TO_BG_THEME[level];
    return (
        <div className={block('message', {theme})}>
            {!error && !yson ? (
                item.text
            ) : (
                <FlowMessageItemExpandable
                    item={item}
                    initialExpanded={initialExpanded}
                    errorType={theme === 'warning' ? 'alert' : undefined}
                />
            )}
        </div>
    );
}

function FlowMessageItemExpandable({
    item,
    errorType,
    initialExpanded,
}: {
    item: FlowMessage;
    errorType?: 'alert';
    initialExpanded: boolean;
}) {
    const [expanded, setExpanded] = React.useState(initialExpanded);

    const toggleExpand = () => setExpanded(!expanded);

    const {yson, error, text} = item;
    return (
        <Flex gap={1} alignItems="baseline">
            <ExpandButton expanded={expanded} toggleExpanded={toggleExpand} />
            <div>
                <span onClick={toggleExpand} style={{cursor: 'pointer'}}>
                    {text ?? format.NO_VALUE}
                </span>
                {expanded && (
                    <React.Fragment>
                        {Boolean(yson) && <Yson value={yson} />}
                        {Boolean(error) && <YTErrorBlock error={error} type={errorType} />}
                    </React.Fragment>
                )}
            </div>
        </Flex>
    );
}
