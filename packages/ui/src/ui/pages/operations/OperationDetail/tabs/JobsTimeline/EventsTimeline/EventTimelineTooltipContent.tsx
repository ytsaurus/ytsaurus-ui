import React, {FC, useMemo} from 'react';
import {JobEvent} from './renderer/JobLineRenderer';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './EventTimelineTooltipContent.scss';
import {EventTimelineTooltipContentRow} from './EventTimelineTooltipContentRow';

const block = cn('yt-event-timeline-tooltip-content');
type Props = {
    events: JobEvent[];
    jobId: string;
};

export const EventTimelineTooltipContent: FC<Props> = ({events, jobId}) => {
    const phaseItems = useMemo(() => {
        if (!events) return [];
        return events.reduce<React.ReactElement[]>((ac, {state, phases, interval}) => {
            const eventDuration = interval.to - interval.from;
            const items = phases.reduce<React.ReactElement[]>((acc, {phase, startTime}, i, arr) => {
                const duration =
                    i > 0 ? startTime - arr[i - 1].startTime : startTime - interval.from;

                acc.push(
                    <EventTimelineTooltipContentRow
                        key={`text_${phase}`}
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
                    key="text_all"
                    state={state}
                    duration={eventDuration}
                />,
                ...items,
            ];
        }, []);
    }, [events]);

    if (!phaseItems.length) return null;

    return (
        <Flex direction="column" gap={3} className={block()}>
            <Text variant="subheader-2">{jobId}</Text>
            <Flex direction="column" gap={1} className={block('phases')}>
                {phaseItems}
            </Flex>
        </Flex>
    );
};
