import React, {FC} from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import cn from 'bem-cn-lite';
import './JobsTable.scss';

const block = cn('yt-jobs-table');

type Props = {
    jobIds: string[];
};

export const JobsTable: FC<Props> = ({jobIds}) => {
    return (
        <Flex direction="column" className={block()}>
            {jobIds.map((id) => (
                <Flex alignItems="center" gap={1} key={id} className={block('item')}>
                    <Icon data={FileIcon} size={16} />
                    <Text variant="body-1" ellipsis>
                        {id}
                    </Text>
                </Flex>
            ))}
        </Flex>
    );
};
