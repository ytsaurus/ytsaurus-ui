import React, {FC} from 'react';
import {JobsTable} from '../JobsTable';
import {EventsTimeline} from '../EventsTimeline';
import {EventsGroupCollapse} from './EventsGroupCollapse';
import {
    Interval,
    JobsTimelineState,
} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import cn from 'bem-cn-lite';
import './EventsGroup.scss';

const block = cn('yt-timeline-event-group');

type Props = {
    groupName: string;
    group: JobsTimelineState['jobs'];
    interval: Interval;
    onTimelineClick: (jobId: string | null) => void;
};

export const EventsGroup: FC<Props> = ({groupName, group, interval, onTimelineClick}) => {
    const jobIds = Object.keys(group);

    return (
        <EventsGroupCollapse key={groupName} title={groupName}>
            <div className={block()}>
                <JobsTable jobIds={jobIds} />
                <EventsTimeline
                    jobs={group}
                    interval={interval}
                    onTimelineClick={onTimelineClick}
                />
            </div>
        </EventsGroupCollapse>
    );
};
