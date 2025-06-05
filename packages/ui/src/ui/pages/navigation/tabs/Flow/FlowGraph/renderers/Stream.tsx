import React from 'react';
import cn from 'bem-cn-lite';

import {Graph} from '@gravity-ui/graph';
import {Flex, Icon, Text} from '@gravity-ui/uikit';

import FileCodeIcon from '@gravity-ui/icons/svgs/file-code.svg';

import format from '../../../../../../common/hammer/format';

//import Link from '../../../../../../components/Link/Link';

import {FlowGraphBlockItem} from '../FlowGraph';

import {FlowMeta} from './FlowMeta';

import './Computation.scss';

const block = cn('yt-flow-stream');

type StreamProps = {
    className?: string;

    graph: Graph;
    item: FlowGraphBlockItem<'stream'>;
};

export function Stream({item, className}: StreamProps) {
    return (
        <div className={block(null, className)}>
            <Flex gap={1} alignItems="center" style={{paddingBottom: '10px'}}>
                <Icon data={FileCodeIcon} />
                <Text variant="caption-2" style={{lineHeight: '12px'}}>
                    {item.name}
                </Text>
            </Flex>
            <FlowMeta
                items={[
                    {
                        label: 'Rows per/s',
                        value: format.Number(item.meta?.messages_per_second),
                        grow: 1,
                    },
                    {label: 'Bytes per/s', value: format.Number(item.meta?.bytes_per_second)},
                ]}
            />
        </div>
    );
}
