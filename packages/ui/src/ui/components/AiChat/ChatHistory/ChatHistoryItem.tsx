import React, {FC} from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import block from 'bem-cn-lite';
import './ChatHistoryItem.scss';

const b = block('yt-chart-history-item');

type Props = {
    id: string;
    topic?: string;
    onClick: (id: string) => void;
    onDelete: (id: string) => void;
};

export const ChatHistoryItem: FC<Props> = ({id, topic, onClick, onDelete}) => {
    return (
        <Flex
            className={b()}
            grow={1}
            alignItems="center"
            justifyContent="space-between"
            onClick={() => onClick(id)}
        >
            <Text ellipsis>{topic || id}</Text>
            <Button
                className={b('remove-button')}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                }}
                view="flat"
            >
                <Icon data={TrashBinIcon} size={16} />
            </Button>
        </Flex>
    );
};
