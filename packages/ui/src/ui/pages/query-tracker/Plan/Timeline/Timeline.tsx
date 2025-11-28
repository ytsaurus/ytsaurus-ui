import React, {FC, useState} from 'react';
import {TimelineHeader} from './TimelineHeader';
import {Flex} from '@gravity-ui/uikit';
import {TimelineList} from './TimelineList';
import {useSelector} from '../../../../store/redux-hooks';
import {getProgressInterval} from '../../../../store/selectors/query-tracker/queryPlan';
import {useTimelineData} from './useTimelineData';
import {useTimeline} from '@gravity-ui/timeline/react';
import {TimelineBlock} from './TimelineBlock';
import './Timeline.scss';
import block from 'bem-cn-lite';
import {ROW_HEIGHT, SCALE_RESERVE_TO_EVENT} from './constants';

const b = block('yt-plan-timeline');

type Interval = {from: number; to: number};

export const Timeline: FC = () => {
    const initialInterval = useSelector(getProgressInterval);
    const [interval, setInterval] = useState(initialInterval);
    const timelineData = useTimelineData();

    const tracksCount = timelineData.tableItems.length;

    const {timeline} = useTimeline({
        settings: {
            start: interval?.from || 0,
            end: interval?.to || 0,
            axes: timelineData.timelineAxes,
            events: timelineData.timelineEvents,
        },
        viewConfiguration: {
            hideRuler: true,
            ruler: {
                height: ROW_HEIGHT,
            },
        },
    });

    const handleScale = (data: 'all' | Interval) => {
        if (typeof data !== 'string') {
            timeline.api.setRange(
                data.from - SCALE_RESERVE_TO_EVENT,
                data.to + SCALE_RESERVE_TO_EVENT,
            );
            return;
        }

        if (initialInterval) {
            timeline.api.setRange(initialInterval.from, initialInterval.to);
            return;
        }
    };

    if (!interval) return null;

    return (
        <Flex direction="column" gap={2} className={b()}>
            <TimelineHeader
                onFilterChange={timelineData.setSearch}
                onStatusChange={timelineData.setStateFilter}
            />
            <div className={b('body')}>
                <TimelineList
                    className={b('list')}
                    timelineData={timelineData}
                    rowHeight={ROW_HEIGHT}
                    onScale={handleScale}
                />
                <TimelineBlock
                    interval={interval}
                    timeline={timeline}
                    style={{
                        height: `${tracksCount * ROW_HEIGHT + ROW_HEIGHT}px`,
                    }}
                    onRangeChange={setInterval}
                />
            </div>
        </Flex>
    );
};
