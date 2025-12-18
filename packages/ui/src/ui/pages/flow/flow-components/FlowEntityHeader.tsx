import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {FlowNodeStatusType, FlowPartitionStateType} from '../../../../shared/yt-types';
import {FlowPartitionState} from '../../../pages/flow/flow-components/FlowPartitionState/FlowPartitionState';
import {FlowNodeStatus} from '../../../pages/flow/Flow/FlowGraph/renderers/FlowGraphRenderer';
import './FlowEntityHeader.scss';

const block = cn('yt-flow-entity-header');

export function FlowEntityTitle({
    className,
    title,
    status,
    state,
}: {
    className?: string;
    title: string;
    status: FlowNodeStatusType;
    state?: FlowPartitionStateType;
}) {
    return (
        <Flex className={block(null, className)} gap={1} alignItems="baseline">
            <Text variant="header-2">{title}</Text>
            {status ? (
                <span>
                    <FlowNodeStatus status={status} />{' '}
                </span>
            ) : null}
            {state ? <FlowPartitionState state={state} /> : null}
        </Flex>
    );
}
