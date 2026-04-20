import React, {type CSSProperties, type FC} from 'react';
import {RangeDateSelection} from '@gravity-ui/date-components';
import {TimelineCanvas, useTimelineEvent} from '@gravity-ui/timeline/react';
import {type Timeline} from '@gravity-ui/timeline';
import {type DateTime, dateTimeParse} from '../../../../utils/date-utils';
import {type OperationTimeline} from './utils';

type Interval = {from: number; to: number};
type Props = {
    interval: Interval;
    timeline: Timeline<OperationTimeline>;
    style?: CSSProperties;
    onRangeChange: (value: {from: number; to: number}) => void;
};

export const TimelineBlock: FC<Props> = ({interval, timeline, style, onRangeChange}) => {
    const handleRangeChange = ({start, end}: {start: DateTime; end: DateTime}) => {
        onRangeChange({from: start.valueOf(), to: end.valueOf()});
    };

    useTimelineEvent(timeline, 'on-camera-change', onRangeChange);

    return (
        <div style={style}>
            <RangeDateSelection
                value={{
                    start: dateTimeParse(interval.from)!,
                    end: dateTimeParse(interval.to)!,
                }}
                displayNow
                hasScaleButtons
                onUpdate={handleRangeChange}
            />
            <TimelineCanvas timeline={timeline} />
        </div>
    );
};
