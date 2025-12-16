import cn from 'bem-cn-lite';
import React from 'react';

import {Dialog, Flex, Icon, Text} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {FlowMessageType, FlowNodeStatusType} from '../../../../../../shared/yt-types';
import format from '../../../../../common/hammer/format';
import {YTErrorBlock} from '../../../../../components/Block/Block';
import {
    ClickableText,
    ClickableTextProps,
} from '../../../../../components/ClickableText/ClickableText';
import {ExpandButton} from '../../../../../components/ExpandButton';
import YTIcon from '../../../../../components/Icon/Icon';
import {Markdown} from '../../../../../components/Markdown/Markdown';
import {YTText} from '../../../../../components/Text/Text';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import Yson from '../../../../../components/Yson/Yson';
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
    const {level, yson, error, markdown_text} = item;
    const theme = STATUS_TO_BG_THEME[level];
    return (
        <div className={block('message', {theme})}>
            {!error && !yson && !markdown_text ? (
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
    item: FlowMessageType;
    errorType?: 'alert';
    initialExpanded: boolean;
}) {
    const [expanded, setExpanded] = React.useState(initialExpanded);

    const toggleExpand = () => setExpanded(!expanded);

    const {yson, markdown_text, error, text} = item;
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
                        {Boolean(markdown_text) && <Markdown text={markdown_text ?? ''} />}
                    </React.Fragment>
                )}
            </div>
        </Flex>
    );
}

export function TextWithHighConsumption({
    children,
    highConsumption,
    detailed,
}: {
    children: string;
    highConsumption?: boolean;
    detailed?: boolean;
}) {
    if (!highConsumption) {
        return children;
    }

    return (
        <Tooltip content="High consumption">
            <YTText color="warning">{children}</YTText>
            &nbsp;
            {detailed ? <YTIcon awesome="question-circle" color="secondary" /> : null}
        </Tooltip>
    );
}

export const STATUS_TO_BG_THEME: Partial<
    Record<FlowNodeStatusType, 'success' | 'info' | 'warning' | 'danger'>
> = {
    warning: 'warning',
    alert: 'warning',
    error: 'danger',
    fatal: 'danger',
    maximum: 'danger',
};

export function FlowNodeStatus({status}: {status: FlowNodeStatusType}) {
    return (
        <Label
            theme={STATUS_TO_BG_THEME[status] ?? 'success'}
            text={status === 'info' ? 'ok' : status}
            capitalize
        />
    );
}
