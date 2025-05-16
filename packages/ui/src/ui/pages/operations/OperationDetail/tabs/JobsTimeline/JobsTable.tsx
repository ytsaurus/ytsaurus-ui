import React, {FC, useMemo} from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import cn from 'bem-cn-lite';
import './JobsTable.scss';
import {TimelineJob} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';

const block = cn('yt-jobs-table');

type Props = {
    name: string;
    jobs: TimelineJob[];
};

export const JobsTable: FC<Props> = ({name, jobs}) => {
    const ids = useMemo(() => {
        const result = new Set<number>();
        jobs.forEach(({cookieId}) => {
            result.add(cookieId);
        });
        return Array.from(result);
    }, [jobs]);

    return (
        <Flex direction="column" className={block()}>
            {ids.map((cookieId) => (
                <Flex alignItems="center" gap={1} key={cookieId} className={block('item')}>
                    <Icon data={FileIcon} size={16} />
                    <Text variant="body-1" ellipsis>
                        {name} {cookieId}
                    </Text>
                </Flex>
            ))}
        </Flex>
    );
};
