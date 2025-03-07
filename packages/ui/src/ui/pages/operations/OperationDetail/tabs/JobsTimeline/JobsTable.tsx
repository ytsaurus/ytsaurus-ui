import React, {FC} from 'react';
import {JobEvent} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import cn from 'bem-cn-lite';
import './JobsTable.scss';

const block = cn('yt-jobs-table');

type Props = {
    events: Record<string, JobEvent[]>;
};

export const JobsTable: FC<Props> = ({events}) => {
    return (
        <Flex direction="column" className={block()}>
            {Object.keys(events).map((key) => (
                <Flex alignItems="center" gap={1} key={key} className={block('item')}>
                    <Icon data={FileIcon} size={16} />
                    <Text variant="body-1" ellipsis>
                        {key}
                    </Text>
                </Flex>
            ))}
        </Flex>
    );
};
