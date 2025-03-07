import React, {FC, useMemo} from 'react';
import {JobEvent} from '../../../../../packages/ya-timeline/components/Events/JobLineRenderer';
import {Flex, Label, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import hammer from '../../../../../common/hammer';
import './EventTimelineTooltipContent.scss';
import {getColorByState} from './helpers/getColorByState';

const getDuration = (duration: number) =>
    hammer.format['TimeDuration'](duration, {format: 'milliseconds'});

const block = cn('yt-event-timeline-tooltip-content');
type Props = {
    event: JobEvent;
    jobId: string;
};

export const EventTimelineTooltipContent: FC<Props> = ({event, jobId}) => {
    const {state, phases, interval} = event;

    const phaseItems = useMemo(() => {
        const eventDuration = interval.to - interval.from;
        return phases.reduce<React.ReactElement[]>(
            (acc, {phase, startTime}, i, arr) => {
                acc.push(<div key={`text_${phase}`}>{hammer.format['ReadableField'](phase)}</div>);

                const duration =
                    i > 0 ? startTime - arr[i - 1].startTime : startTime - interval.from;

                acc.push(<div key={`val_${phase}`}>{getDuration(duration)}</div>);
                return acc;
            },
            [
                <div key="text_all">&mdash;</div>,
                <div key="val_all">{getDuration(eventDuration)}</div>,
            ],
        );
    }, [interval, phases]);

    return (
        <Flex direction="column" gap={3} className={block()}>
            <Flex direction="column" gap={2}>
                <Text variant="subheader-2">{jobId}</Text>
                <Flex gap={2} alignItems="center">
                    <div
                        className={block('color-brick')}
                        style={{background: getColorByState(state)}}
                    />
                    <Text variant="subheader-1">{hammer.format['ReadableField'](state)}</Text>
                    {phases.length > 0 && <Label>{phases.length} phases</Label>}
                </Flex>
            </Flex>
            <div className={block('phases')}>{phaseItems}</div>
        </Flex>
    );
};
