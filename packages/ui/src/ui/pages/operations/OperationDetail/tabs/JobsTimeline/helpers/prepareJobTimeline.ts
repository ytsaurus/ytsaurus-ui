import {JobsTimelineState} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {TimelineAxis} from '../../../../../../packages/ya-timeline';
import {JobLineEvent} from '../EventsTimeline/renderer/JobLineRenderer';
import {getColorByState} from './getColorByState';
import {ROW_HEIGHT} from '../constants';

export const prepareJobTimeline = (jobs: JobsTimelineState['jobs']) => {
    return Object.keys(jobs).reduce<{axes: TimelineAxis[]; timelines: JobLineEvent[]}>(
        (acc, jobId, i) => {
            acc.axes.push({
                id: jobId,
                top: ROW_HEIGHT * i,
                height: ROW_HEIGHT,
                tracksCount: 1,
            });

            const timelineJob = jobs[jobId];
            const jobEvents = timelineJob.events;
            acc.timelines.push({
                renderType: 'jobLine',
                axisId: jobId,
                eventsCount: jobEvents.length,
                trackIndex: 0,
                from: jobEvents[0].startTime,
                to: jobEvents.at(-1)?.endTime,
                parts: jobEvents.reduce<JobLineEvent['parts']>((a, event) => {
                    a.push({
                        percentage: event.percent,
                        color: getColorByState(event.state),
                        state: event.state,
                        interval: {
                            from: event.startTime,
                            to: event.endTime,
                        },
                        phases: event.phases,
                    });
                    return a;
                }, []),
            });

            return acc;
        },
        {
            axes: [],
            timelines: [],
        },
    );
};
