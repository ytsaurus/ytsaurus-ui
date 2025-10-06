import React, {FC, ReactNode, useMemo} from 'react';
import {JobEvent} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {Table} from '@gravity-ui/uikit';
import '../mixin/stateMixin.scss';
import './EventsTable.scss';
import cn from 'bem-cn-lite';
import hammer from '../../../../../../common/hammer';
import {getPhaseColor} from '../helpers/getPhaseColor';
import {isFinalState} from '../helpers/isFinalState';

const block = cn('yt-events-table');

const PhaseNameCell: FC<{state: string; phase: string}> = ({state, phase}) => {
    return (
        <div className={block('row', {state: getPhaseColor(state, phase)})}>
            {hammer.format['ReadableField'](state)}: {hammer.format['ReadableField'](phase)}
        </div>
    );
};

const getDateTime = (timestamp: number) =>
    hammer.format['DateTime'](new Date(timestamp).toString());

type Props = {
    events: JobEvent[];
};

export const EventsTable: FC<Props> = ({events}) => {
    const data = useMemo(() => {
        return events.reduce<{phase: ReactNode; duration: string; startTime: string}[]>(
            (acc, event) => {
                const eventDuration = event.endTime - event.startTime;
                const isFinal = isFinalState(event.state);

                acc.push({
                    phase: <PhaseNameCell state={event.state} phase="&mdash;" />,
                    duration: isFinal
                        ? hammer.format.NO_VALUE
                        : hammer.format['TimeDuration'](eventDuration, {
                              format: 'milliseconds',
                          }),
                    startTime: getDateTime(event.startTime),
                });

                event.phases.forEach((eventPhase, index) => {
                    const nextPhase = event.phases[index + 1];
                    const phaseEndTime = nextPhase ? nextPhase.startTime : event.endTime;
                    const phaseDuration = phaseEndTime - eventPhase.startTime;

                    acc.push({
                        phase: <PhaseNameCell state={event.state} phase={eventPhase.phase} />,
                        duration: isFinal
                            ? hammer.format.NO_VALUE
                            : hammer.format['TimeDuration'](phaseDuration, {
                                  format: 'milliseconds',
                              }),
                        startTime: getDateTime(eventPhase.startTime),
                    });
                });
                return acc;
            },
            [],
        );
    }, [events]);

    return (
        <Table
            className={block()}
            width="max"
            columns={[
                {id: 'phase', name: 'State: Phase'},
                {id: 'duration', name: 'Duration'},
                {id: 'startTime', name: 'Start time'},
            ]}
            data={data}
        />
    );
};
