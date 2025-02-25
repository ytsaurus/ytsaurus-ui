import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {
    getSelectedJob,
    selectJobId,
} from '../../../../../../store/selectors/operations/jobs-timeline';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import './EventsSidePanel.scss';
import cn from 'bem-cn-lite';
import {EventsTable} from './EventsTable';

const block = cn('yt-events-side-panel');

type Props = {
    onClose: () => void;
};

export const EventsSidePanel: FC<Props> = ({onClose}) => {
    const jobId = useSelector(selectJobId);
    const job = useSelector(getSelectedJob);

    if (!jobId || !job) return null;

    return (
        <div className={block()}>
            <Flex alignItems="center" justifyContent="space-between">
                <Text variant="subheader-3">{jobId}</Text>
                <Button view="flat" onClick={onClose}>
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </Flex>
            <div className={block('separator')} />
            <EventsTable events={job.events} />
        </div>
    );
};
