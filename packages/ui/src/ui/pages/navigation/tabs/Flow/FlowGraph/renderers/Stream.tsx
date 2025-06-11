import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Icon, Text} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import {FlowGraphBlockItem} from '../FlowGraph';

import {FlowMeta} from './FlowMeta';

import './Stream.scss';

const block = cn('yt-flow-stream');

type StreamProps = {
    className?: string;

    detailed?: boolean;

    item: FlowGraphBlockItem<'stream'>;
};

export function Stream({item, detailed, className}: StreamProps) {
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
                        label: 'Messages',
                        value: (
                            <div>
                                {detailed && (
                                    <div>{format.Number(item.meta?.messages_per_second)}</div>
                                )}
                                {format.Bytes(item.meta?.bytes_per_second, {
                                    digits: detailed ? 2 : 0,
                                }) + '/s'}
                            </div>
                        ),
                    },
                    {
                        label: 'Inflight',
                        value: (
                            <div>
                                {detailed && <div>{format.Number(item.meta?.inflight_rows)}</div>}
                                {format.Bytes(item.meta?.inflight_bytes, {
                                    digits: detailed ? 2 : 0,
                                })}
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
