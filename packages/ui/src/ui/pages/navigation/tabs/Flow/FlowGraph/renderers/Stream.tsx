import React from 'react';
import cn from 'bem-cn-lite';

import {Graph} from '@gravity-ui/graph';
import {Flex, Icon, Text} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import {FlowGraphBlockItem} from '../FlowGraph';

import {FlowMeta} from './FlowMeta';

import './Stream.scss';

const block = cn('yt-flow-stream');

type StreamProps = {
    className?: string;

    graph: Graph;
    item: FlowGraphBlockItem<'stream'>;
};

export function Stream({item, className}: StreamProps) {
    return (
        <div className={block(null, className)}>
            <Flex gap={1} alignItems="center" style={{paddingBottom: '10px'}} overflow="hidden">
                {item.icon && (
                    <Flex shrink={0}>
                        <Icon className={block('icon')} data={item.icon} />
                    </Flex>
                )}
                <Text variant="caption-2" style={{lineHeight: '12px'}} ellipsis>
                    {item.name}
                </Text>
            </Flex>
            <FlowMeta
                items={[
                    {
                        label: 'Inflight per/s',
                        value: format.Bytes(item.meta?.inflight_bytes, {digits: 1}),
                    },
                    {
                        label: 'Bytes per/s',
                        value: format.Bytes(item.meta?.bytes_per_second, {digits: 1}),
                    },
                ]}
            />
        </div>
    );
}
