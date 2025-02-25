import React, {FC} from 'react';
import hammer from '../../../../../../common/hammer';
import './EventTimelineTooltipContentRow.scss';
import cn from 'bem-cn-lite';
import {Flex} from '@gravity-ui/uikit';
import {getPhaseColor} from '../helpers/getPhaseColor';

const block = cn('yt-event-timeline-tooltip-content-row');

type Props = {
    state: string;
    phase?: string;
    duration: number;
};

export const EventTimelineTooltipContentRow: FC<Props> = ({state, phase, duration}) => {
    return (
        <Flex justifyContent="space-between" gap={2} className={block()}>
            <div className={block('title', {state: getPhaseColor(state, phase)})}>
                {hammer.format['ReadableField'](state)}:{' '}
                {phase ? hammer.format['ReadableField'](phase) : <>&mdash;</>}
            </div>
            <div>{hammer.format['TimeDuration'](duration, {format: 'milliseconds'})}</div>
        </Flex>
    );
};
