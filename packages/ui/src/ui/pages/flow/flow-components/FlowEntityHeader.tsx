import {Flex, Text} from '@gravity-ui/uikit';
import React from 'react';
import {FlowNodeStatus} from '../Flow/FlowGraph/renderers/FlowGraphRenderer';
import {FlowNodeStatusType} from '../../../../shared/yt-types';
import cn from 'bem-cn-lite';

const block = cn('yt-flow-entity-header');

export function FlowEntityTitle({
    className,
    title,
    status,
}: {
    className?: string;
    title: string;
    status?: FlowNodeStatusType;
}) {
    return (
        <Flex className={block(null, className)} gap={1} alignItems="baseline">
            <Text variant="header-2">{title}</Text>
            {status ? (
                <span>
                    <FlowNodeStatus status={status} />{' '}
                </span>
            ) : null}
        </Flex>
    );
}
