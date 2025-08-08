import React, {FC, useMemo} from 'react';
import {JobLineEvent} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './EventTimelineTooltipContent.scss';
import {EventTimelineTooltipContentRow} from './EventTimelineTooltipContentRow';
import {MetaData} from './MetaData';

const block = cn('yt-event-timeline-tooltip-content');
type Props = {
    event: JobLineEvent;
};

export const EventTimelineTooltipContent: FC<Props> = ({event: {parts, jobId, meta}}) => {
    const phaseItems = useMemo(() => {
        if (!parts) return [];
        return parts.reduce<React.ReactElement[]>((ac, {state, phases, interval}) => {
            const eventDuration = interval.to - interval.from;
            const items = phases.reduce<React.ReactElement[]>((acc, {phase, startTime}, i, arr) => {
                const duration =
                    i > 0 ? startTime - arr[i - 1].startTime : startTime - interval.from;

                acc.push(
                    <EventTimelineTooltipContentRow
                        key={`text_${phase}_${startTime}`}
                        phase={phase}
                        state={state}
                        duration={duration}
                    />,
                );
                return acc;
            }, []);

            return [
                ...ac,
                <EventTimelineTooltipContentRow
                    key={'text_all_' + eventDuration}
                    state={state}
                    duration={eventDuration}
                />,
                ...items,
            ];
        }, []);
    }, [parts]);

    if (!phaseItems.length) return null;

    return (
        <Flex direction="column" gap={3} className={block()}>
            <Text variant="subheader-2">Job id: {jobId}</Text>
            <MetaData meta={meta} />
            <Flex direction="column" gap={1} className={block('phases')}>
                {phaseItems}
            </Flex>
        </Flex>
    );
};
