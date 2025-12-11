import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import {FlowGraphBlockItem} from '../FlowGraph';

import {FlowMeta} from './FlowMeta';

import {FlowCaption2, FlowIcon, FlowMessages} from './FlowGraphRenderer';

type StreamProps = {
    className?: string;

    detailed?: boolean;

    item: FlowGraphBlockItem<'stream'>;
};

export function Stream({item, detailed, className}: StreamProps) {
    return (
        <div className={className}>
            <Flex gap={1} alignItems="center" style={{paddingBottom: '10px'}} overflow="hidden">
                <FlowIcon data={item.icon} />
                <FlowCaption2 text={item.name} />
            </Flex>
            <FlowMeta
                items={[
                    {
                        label: 'Messages',
                        value: (
                            <Flex direction="column">
                                <Text variant="inherit" whiteSpace="nowrap" ellipsis>
                                    {format.Number(item.meta?.messages_per_second)} pcs/s
                                </Text>
                                <Text variant="inherit" whiteSpace="nowrap" ellipsis>
                                    {format.Bytes(item.meta?.bytes_per_second, {
                                        digits: detailed ? 2 : 0,
                                    }) + '/s'}
                                </Text>
                            </Flex>
                        ),
                    },
                    {
                        label: 'Inflight rows',
                        value: (
                            <Flex direction="column" style={{overflow: 'hidden'}}>
                                <Text variant="inherit" whiteSpace="nowrap" ellipsis>
                                    {format.Number(item.meta?.inflight_rows)}
                                </Text>
                                <Text variant="inherit" whiteSpace="nowrap" ellipsis>
                                    {format.Bytes(item.meta?.inflight_bytes, {
                                        digits: detailed ? 2 : 0,
                                    })}
                                </Text>
                            </Flex>
                        ),
                    },
                ]}
            />
            {detailed && <FlowMessages data={item.meta.messages} />}
        </div>
    );
}
