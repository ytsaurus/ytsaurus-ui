import React, {FC, ReactNode} from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import cn from 'bem-cn-lite';
import './TimelineTable.scss';

const block = cn('yt-timeline-table');

export type Item = {id: string; content: ReactNode};

type Props = {
    items: Item[];
    rowHeight: number;
    className?: string;
};

export const TimelineTable: FC<Props> = ({items, rowHeight, className}) => {
    return (
        <Flex direction="column" className={block(null, className)}>
            {items.map(({id, content}) => (
                <Flex
                    alignItems="center"
                    gap={1}
                    key={id}
                    className={block('item')}
                    style={{height: `${rowHeight}px`}}
                >
                    <Icon data={FileIcon} size={16} />
                    <Text variant="body-1" ellipsis>
                        {content}
                    </Text>
                </Flex>
            ))}
        </Flex>
    );
};
